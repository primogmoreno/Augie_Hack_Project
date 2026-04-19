from flask import Flask, jsonify, request, session
from flask_cors import CORS
from interfacer import PlaidClient
from google import genai
from google.genai import types as genai_types
import os
import json
import time
import urllib.request
from datetime import date, datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = "324wybhw324wiewbsdiaufw7r30eqwe23e"  # change this to something random
CORS(app, supports_credentials=True)

plaid = PlaidClient()

_gemini_key = os.getenv("GEMINI_API_KEY")
gemini_client = genai.Client(api_key=_gemini_key) if _gemini_key else None

# ── Serialization ──────────────────────────────────────────────────────────────

def _serialize(obj):
    """Recursively convert Plaid SDK objects and dates to JSON-safe types."""
    if hasattr(obj, 'to_dict'):
        return _serialize(obj.to_dict())
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items() if v is not None}
    if isinstance(obj, list):
        return [_serialize(i) for i in obj]
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    return obj

# ── Transaction enrichment ─────────────────────────────────────────────────────

CATEGORY_ICONS = {
    'Food & Dining':      '🍽', 'Shopping':            '🛍', 'Transport':  '🚗',
    'Entertainment':      '🎬', 'Utilities':            '⚡', 'Income':     '💰',
    'Healthcare':         '🏥', 'Savings & Investing':  '🏦', 'Other':      '📦',
}

CATEGORY_COLORS = {
    'Food & Dining':       {'primary': '#185FA5', 'light': '#E6F1FB'},
    'Shopping':            {'primary': '#639922', 'light': '#EAF3DE'},
    'Transport':           {'primary': '#BA7517', 'light': '#FAEEDA'},
    'Entertainment':       {'primary': '#533AB7', 'light': '#EEEDFE'},
    'Utilities':           {'primary': '#5F5E5A', 'light': '#F1EFE8'},
    'Income':              {'primary': '#3B6D11', 'light': '#EAF3DE'},
    'Healthcare':          {'primary': '#993556', 'light': '#FBEAF0'},
    'Savings & Investing': {'primary': '#1F7A6B', 'light': '#EAF5F3'},
    'Other':               {'primary': '#888780', 'light': '#F1EFE8'},
}

# Merchant name keywords that reliably indicate savings/investing regardless of PFC
_SAVINGS_KEYWORDS = [
    'CD DEPOSIT', 'CERTIFICATE OF DEPOSIT', 'SAVINGS DEPOSIT', 'SAVINGS TRANSFER',
    'INVEST', 'VANGUARD', 'FIDELITY', 'SCHWAB', 'ROBINHOOD', 'E*TRADE', 'ETRADE',
    'MERRILL', 'BETTERMENT', 'WEALTHFRONT', '401K', 'IRA DEPOSIT', 'ROTH',
    'MONEY MARKET', 'MUTUAL FUND', 'BROKERAGE', 'TD AMERITRADE', 'ACORNS',
]

def _normalize_cat_pfc(pfc_primary):
    """Map Plaid personal_finance_category.primary (uppercase) to our categories."""
    p = (pfc_primary or '').upper()
    if any(k in p for k in ['FOOD', 'RESTAURANT', 'GROCER', 'COFFEE', 'DINING']):
        return 'Food & Dining'
    if any(k in p for k in ['TRANSPORT', 'TRAVEL', 'GAS_STATION', 'TAXI', 'PARKING']):
        return 'Transport'
    if any(k in p for k in ['GENERAL_MERCHANDISE', 'SHOP', 'RETAIL', 'CLOTHE', 'SPORTING_GOODS']):
        return 'Shopping'
    if any(k in p for k in ['ENTERTAINMENT', 'RECREATION', 'STREAMING', 'SPORT_AND_FITNESS']):
        return 'Entertainment'
    if any(k in p for k in ['UTILITIES', 'RENT_AND_UTILITIES', 'PHONE', 'INTERNET', 'ELECTRIC']):
        return 'Utilities'
    if any(k in p for k in ['INCOME', 'PAYROLL', 'TRANSFER_IN']):
        return 'Income'
    if any(k in p for k in ['MEDICAL', 'HEALTHCARE', 'PHARMACY', 'DOCTOR', 'DENTAL']):
        return 'Healthcare'
    if any(k in p for k in ['TRANSFER_OUT', 'SAVINGS', 'INVESTMENT', 'LOAN_PAYMENT']):
        return 'Savings & Investing'
    return 'Other'

def _normalize_cat_legacy(cats):
    """Map legacy Plaid category array to our categories."""
    if not cats:
        return 'Other'
    primary   = (cats[0] if cats else '').lower()
    secondary = (cats[1] if len(cats) > 1 else '').lower()
    if 'food' in primary or 'restaurant' in primary or 'groceries' in secondary or 'coffee' in secondary:
        return 'Food & Dining'
    if 'travel' in primary or 'gas' in secondary or 'uber' in secondary or 'lyft' in secondary or 'taxi' in secondary or 'transport' in primary:
        return 'Transport'
    if 'shops' in primary or 'shopping' in primary or 'amazon' in secondary or 'walmart' in secondary or 'target' in secondary:
        return 'Shopping'
    if 'recreation' in primary or 'entertainment' in primary or 'netflix' in secondary or 'spotify' in secondary or 'hulu' in secondary:
        return 'Entertainment'
    if 'utilities' in primary or 'electric' in secondary or 'internet' in secondary or 'phone' in secondary or 'energy' in secondary:
        return 'Utilities'
    if 'transfer' in primary or 'deposit' in primary or 'payroll' in primary or 'income' in primary:
        return 'Income'
    if 'healthcare' in primary or 'medical' in primary or 'pharmacy' in primary:
        return 'Healthcare'
    return 'Other'

def _normalize_tx(t):
    pfc = t.get('personal_finance_category') or {}
    pfc_primary = pfc.get('primary') if isinstance(pfc, dict) else None
    cat = _normalize_cat_pfc(pfc_primary) if pfc_primary else _normalize_cat_legacy(t.get('category') or [])

    # Name-based override — merchant name is the most reliable signal for savings/investing
    name_upper = ((t.get('merchant_name') or t.get('name', ''))).upper()
    if any(k in name_upper for k in _SAVINGS_KEYWORDS):
        cat = 'Savings & Investing'
    amount = t.get('amount', 0)
    tx_type = 'debit' if amount > 0 else 'credit'
    d = t.get('date', '')
    try:
        date_obj = datetime.strptime(d, '%Y-%m-%d')
        date_formatted = date_obj.strftime('%b') + ' ' + str(date_obj.day)
    except Exception:
        date_formatted = d
    return {
        'id':             t.get('transaction_id'),
        'merchant':       t.get('merchant_name') or t.get('name', ''),
        'date':           d,
        'date_formatted': date_formatted,
        'amount':         amount,
        'amount_display': f"${abs(amount):.2f}",
        'category':       cat,
        'type':           tx_type,
        'is_recurring':   False,
        'merchant_icon':  CATEGORY_ICONS.get(cat, '📦'),
        'pending':        t.get('pending', False),
    }

def _detect_recurring(transactions):
    by_merchant = {}
    for tx in transactions:
        key = (tx.get('merchant') or '').lower().strip()
        by_merchant.setdefault(key, []).append(tx)
    recurring = set()
    for key, txs in by_merchant.items():
        if len(txs) < 2 or any(t['type'] == 'credit' for t in txs):
            continue
        amounts = [t['amount'] for t in txs]
        avg = sum(amounts) / len(amounts)
        if avg and all(abs(a - avg) / avg < 0.05 for a in amounts):
            recurring.add(key)
    return [{**tx, 'is_recurring': (tx.get('merchant') or '').lower().strip() in recurring} for tx in transactions]

def _bucket_by_week(transactions):
    weeks = {}
    for tx in transactions:
        if tx.get('type') != 'debit':
            continue
        try:
            d = datetime.strptime(tx['date'], '%Y-%m-%d')
        except Exception:
            continue
        monday = d - timedelta(days=d.weekday())
        iso_key = monday.strftime('%Y-%m-%d')
        weeks[iso_key] = round(weeks.get(iso_key, 0) + abs(tx['amount']), 2)
    result = []
    for iso_key in sorted(weeks):
        mo = datetime.strptime(iso_key, '%Y-%m-%d')
        result.append({'week': mo.strftime('%b') + ' ' + str(mo.day), 'total': weeks[iso_key]})
    return result

def _fetch_transactions_normalized(access_token, days=90):
    start = date.today() - timedelta(days=days)
    last_err = None
    for attempt in range(4):
        try:
            raw = plaid.get_transactions(access_token, start_date=start)
            return _detect_recurring([_normalize_tx(_serialize(t)) for t in raw])
        except Exception as e:
            last_err = e
            if 'PRODUCT_NOT_READY' in str(e) and attempt < 3:
                time.sleep(1.5)
                continue
            raise last_err

# ── FRED savings rate (24 h cache) ────────────────────────────────────────────

_fred_cache = {'rate': 3.8, 'ts': 0}

def _get_national_savings_rate():
    if time.time() - _fred_cache['ts'] < 86400:
        return _fred_cache['rate']
    try:
        url = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=PSAVERT'
        with urllib.request.urlopen(url, timeout=5) as resp:
            text = resp.read().decode()
        value = float(text.strip().split('\n')[-1].split(',')[1])
        _fred_cache.update({'rate': value, 'ts': time.time()})
        return value
    except Exception:
        return 3.8

@app.route("/api/create_link_token", methods=["POST"])
def create_link_token():
    try:
        token = plaid.create_link_token(user_id="user-123")
        return jsonify({"link_token": token})
    except Exception as e:
        print('create_link_token error', e)
        return jsonify({'error': str(e)}), 500

@app.route("/api/exchange_public_token", methods=["POST"])
def exchange_public_token():
    public_token = request.json.get("public_token")
    access_token, item_id = plaid.exchange_public_token(public_token)
    session['access_token'] = access_token  # never returned to frontend
    return jsonify({"success": True})

@app.route('/api/accounts', methods=['GET'])
def get_accounts():
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({'error': 'Not connected'}), 401
    try:
        accounts = plaid.get_accounts(access_token)
        try:
            liabilities = plaid.get_liabilities(access_token)
            liabilities_dict = liabilities.to_dict() if hasattr(liabilities, 'to_dict') else liabilities
        except Exception:
            liabilities_dict = {}
        return jsonify({'accounts': _serialize(accounts), 'liabilities': _serialize(liabilities_dict)})
    except Exception as e:
        print('accounts error', e)
        return jsonify({'error': 'Failed to fetch accounts'}), 500

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({'error': 'Not connected'}), 401
    try:
        days = int(request.args.get('days', 90))
        transactions = _fetch_transactions_normalized(access_token, days)
        return jsonify({'transactions': transactions})
    except Exception as e:
        if 'PRODUCT_NOT_READY' in str(e):
            return jsonify({'transactions': [], 'pending': True}), 200
        print('transactions error', e)
        return jsonify({'error': 'Failed to fetch transactions'}), 500

@app.route('/api/summary', methods=['GET'])
def get_summary():
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({'error': 'Not connected'}), 401
    try:
        days = int(request.args.get('days', 90))
        transactions = _fetch_transactions_normalized(access_token, days)

        debits   = [t for t in transactions if t['type'] == 'debit']
        credits  = [t for t in transactions if t['type'] == 'credit']
        savings  = [t for t in debits if t['category'] == 'Savings & Investing']
        spending = [t for t in debits if t['category'] != 'Savings & Investing']

        total_spent      = round(sum(t['amount'] for t in spending), 2)
        total_income     = round(abs(sum(t['amount'] for t in credits)), 2)
        savings_invested = round(sum(t['amount'] for t in savings), 2)

        recurring       = [t for t in spending if t['is_recurring']]
        recurring_total = round(sum(t['amount'] for t in recurring), 2)
        recurring_count = len({(t.get('merchant') or '').lower().strip() for t in recurring})

        savings_rate = round((total_income - total_spent) / total_income * 100, 1) if total_income > 0 else 0

        cat_sums = {}
        for t in debits:
            cat_sums[t['category']] = round(cat_sums.get(t['category'], 0) + t['amount'], 2)

        category_totals = sorted(
            [{'category': cat, 'total': total, 'color': CATEGORY_COLORS.get(cat, CATEGORY_COLORS['Other'])}
             for cat, total in cat_sums.items()],
            key=lambda x: x['total'], reverse=True
        )

        return jsonify({
            'total_spent':           total_spent,
            'total_income':          total_income,
            'savings_invested':      savings_invested,
            'recurring_total':       recurring_total,
            'recurring_count':       recurring_count,
            'savings_rate':          savings_rate,
            'national_savings_rate': _get_national_savings_rate(),
            'transaction_count':     len(transactions),
            'period_days':           days,
            'weekly_spending':       _bucket_by_week(transactions),
            'category_totals':       category_totals,
        })
    except Exception as e:
        if 'PRODUCT_NOT_READY' in str(e):
            return jsonify({'pending': True}), 200
        print('summary error', e)
        return jsonify({'error': 'Failed to fetch summary'}), 500

@app.route('/api/rates', methods=['GET'])
def rates():
    try:
        rates_data =  {
      "lastFetched": "2024-06-01T12:00:00Z",
      "series": [
        { "date": "Q1 2022", "creditUnion": 10.8, "bank": 14.1 },
        { "date": "Q2 2022", "creditUnion": 11.0, "bank": 14.4 },
        { "date": "Q3 2022", "creditUnion": 11.3, "bank": 14.9 },
        { "date": "Q4 2022", "creditUnion": 11.6, "bank": 15.3 },
        { "date": "Q1 2023", "creditUnion": 11.8, "bank": 15.7 },
        { "date": "Q2 2023", "creditUnion": 12.0, "bank": 16.0 },
        { "date": "Q3 2023", "creditUnion": 12.2, "bank": 16.3 },
        { "date": "Q4 2023", "creditUnion": 12.1, "bank": 16.1 },
        { "date": "Q1 2024", "creditUnion": 12.0, "bank": 16.0 },
        { "date": "Q2 2024", "creditUnion": 11.9, "bank": 15.8 }
      ],
      "latest": { "creditUnion": 11.9, "bank": 15.8 }
    }
        return jsonify(rates_data)
    except Exception as e:
        print('rates error', e)
        return jsonify({'error': 'Failed to fetch rates'}), 500
def _require_gemini():
    if not gemini_client:
        return jsonify({'error': 'GEMINI_API_KEY not configured'}), 503
    return None

GEMINI_MODEL = "gemini-2.5-flash"

@app.route('/api/gemini/analyze-spending', methods=['POST'])
def analyze_spending():
    err = _require_gemini()
    if err: return err
    transactions = request.json.get('transactions', [])
    tx_lines = '\n'.join(
        f"- {t.get('date','')}: {t.get('name','')}, ${t.get('amount',0):.2f}, category: {t.get('personal_finance_category', {}).get('primary', t.get('category', ['Other'])[0] if t.get('category') else 'Other')}"
        for t in transactions[:100]
    )
    prompt = f"""You are a friendly financial coach. Analyze these transactions and explain what's happening in plain English — no jargon.
Cover: top spending categories, any notable patterns or outliers, one actionable suggestion.
Keep it under 200 words.

Transactions:
{tx_lines or 'No transactions provided.'}"""
    try:
        response = gemini_client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
        return jsonify({'analysis': response.text})
    except Exception as e:
        print('gemini analyze error', e)
        return jsonify({'error': 'Gemini request failed'}), 500

@app.route('/api/gemini/decode-jargon', methods=['POST'])
def decode_jargon():
    err = _require_gemini()
    if err: return err
    term = request.json.get('term', '').strip()
    if not term:
        return jsonify({'error': 'No term provided'}), 400
    prompt = f"""Explain the financial term "{term}" in three numbered sections:
1. Plain-English definition (2-3 sentences, no jargon)
2. Why it matters for you (practical impact on everyday finances)
3. What to ask your credit union (one specific question they can ask)

Be concise and conversational."""
    try:
        response = gemini_client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
        return jsonify({'reply': response.text})
    except Exception as e:
        print('gemini jargon error', e)
        return jsonify({'error': 'Gemini request failed'}), 500

@app.route('/api/gemini/chat', methods=['POST'])
def gemini_chat():
    err = _require_gemini()
    if err: return err
    messages = request.json.get('messages', [])
    account_summary = request.json.get('accountSummary')

    system_parts = ["You are a friendly, knowledgeable financial literacy coach. Be concise, warm, and practical. Avoid jargon."]
    if account_summary:
        system_parts.append(
            f"User's account context: checking ${account_summary.get('checkingBal','N/A')}, "
            f"savings ${account_summary.get('savingsBal','N/A')}, "
            f"credit balance ${account_summary.get('creditBal','N/A')}, "
            f"credit limit ${account_summary.get('creditLimit','N/A')}, "
            f"APR {account_summary.get('creditApr','N/A')}%."
        )
    system_prompt = ' '.join(system_parts)

    history = []
    for m in messages[:-1]:
        role = 'model' if m.get('role') == 'model' else 'user'
        history.append(genai_types.Content(role=role, parts=[genai_types.Part(text=m.get('content', ''))]))

    last_message = messages[-1].get('content', '') if messages else ''

    try:
        chat = gemini_client.chats.create(
            model=GEMINI_MODEL,
            config=genai_types.GenerateContentConfig(system_instruction=system_prompt),
            history=history,
        )
        response = chat.send_message(last_message)
        return jsonify({'reply': response.text})
    except Exception as e:
        print('gemini chat error', e)
        return jsonify({'error': 'Gemini request failed'}), 500

@app.route('/api/gemini/simulate-tips', methods=['POST'])
def simulate_tips():
    err = _require_gemini()
    if err: return err
    import re
    data       = request.json or {}
    answers    = data.get('answers', {})
    user_needs    = data.get('userNeeds', 0)
    user_wants    = data.get('userWants', 0)
    user_savings  = data.get('userSavings', 0)
    typ_needs     = data.get('typicalNeeds', 0)
    typ_wants     = data.get('typicalWants', 0)
    typ_savings   = data.get('typicalSavings', 0)
    prompt = f"""You are a friendly financial coach reviewing someone's self-reported monthly budget.
Give 3–5 concise, specific, actionable tips — plain English, no jargon.

Their budget:
- Monthly Income: ${answers.get('monthlyIncome', 0)}
- Savings: ${answers.get('monthlySavings', 0)}
- Housing: ${answers.get('housing', 0)}
- Loans: ${answers.get('loans', 0)}
- Insurance: ${answers.get('insurance', 0)}
- Transportation: ${answers.get('transportation', 0)}
- Utilities: ${answers.get('utilities', 0)}
- Food: ${answers.get('food', 0)}
- Entertainment: ${answers.get('entertainment', 0)}
- Clothing: ${answers.get('clothing', 0)}
- Other: ${answers.get('otherExpenses', 0)}

50/30/20 guideline for their income:
  Needs (50%): ${typ_needs:.0f} — they spend ${user_needs:.0f}
  Wants (30%): ${typ_wants:.0f} — they spend ${user_wants:.0f}
  Savings (20%): ${typ_savings:.0f} — they save ${user_savings:.0f}

Return ONLY a JSON array of tip strings, e.g. ["Tip one.", "Tip two."]"""
    try:
        response = gemini_client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
        match = re.search(r'\[.*?\]', response.text, re.DOTALL)
        if match:
            tips = json.loads(match.group())
        else:
            tips = [t.strip().lstrip('•-0123456789. ') for t in response.text.split('\n') if len(t.strip()) > 15]
        return jsonify({'tips': tips[:5]})
    except Exception as e:
        print('gemini simulate-tips error', e)
        return jsonify({'error': 'Gemini request failed'}), 500

if __name__ == "__main__":
    app.run(port=5000)
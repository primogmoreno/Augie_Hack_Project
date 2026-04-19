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

@app.route('/api/health/tree-data', methods=['GET'])
def tree_data():
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({'error': 'Not connected'}), 401
    try:
        # ── Fetch all Plaid data ────────────────────────────────────────
        transactions_90 = _fetch_transactions_normalized(access_token, 90)
        accounts_resp   = plaid.get_accounts(access_token)
        accounts_list   = _serialize(accounts_resp)

        try:
            liabilities_resp = plaid.get_liabilities(access_token)
            liabilities      = _serialize(liabilities_resp.to_dict() if hasattr(liabilities_resp, 'to_dict') else liabilities_resp)
        except Exception:
            liabilities = {}

        # ── Accounts by subtype ─────────────────────────────────────────
        def acc_balance(acc):
            bal = acc.get('balances', {}) or {}
            return bal.get('current') or bal.get('available') or 0

        savings_accs   = [a for a in accounts_list if a.get('subtype') in ('savings', 'money market', 'cd')]
        credit_accs    = [a for a in accounts_list if a.get('type') == 'credit']
        invest_accs    = [a for a in accounts_list if a.get('type') in ('investment', 'brokerage')]

        savings_balance      = sum(acc_balance(a) for a in savings_accs)
        total_credit_balance = sum(acc_balance(a) for a in credit_accs)
        total_credit_limit   = sum((a.get('balances', {}) or {}).get('limit') or 0 for a in credit_accs)

        # ── Income / spending ───────────────────────────────────────────
        debits   = [t for t in transactions_90 if t['type'] == 'debit' and t['category'] != 'Savings & Investing']
        credits  = [t for t in transactions_90 if t['type'] == 'credit']
        savings_txs = [t for t in transactions_90 if t['category'] == 'Savings & Investing']

        total_income     = abs(sum(t['amount'] for t in credits))
        total_spending   = sum(t['amount'] for t in debits)
        savings_invested = sum(t['amount'] for t in savings_txs)

        monthly_income   = total_income / 3.0 if total_income > 0 else 1
        monthly_expenses = total_spending / 3.0

        # ── Savings pillar ──────────────────────────────────────────────
        emergency_fund_months = savings_balance / monthly_expenses if monthly_expenses > 0 else 0
        monthly_savings_rate  = (savings_invested / 3.0 / monthly_income * 100) if monthly_income > 0 else 0
        # Consistent deposits: savings tx in at least 2 of the 3 months
        months_with_savings = set()
        for t in savings_txs:
            try:
                months_with_savings.add(datetime.strptime(t['date'], '%Y-%m-%d').month)
            except Exception:
                pass
        has_consistent_deposits = len(months_with_savings) >= 2

        savings_score = 0
        savings_score += min(50, emergency_fund_months * (50 / 6))
        savings_score += 30 if has_consistent_deposits else 0
        savings_score += min(20, monthly_savings_rate)
        savings_score = round(min(100, savings_score))

        # ── Debt pillar ─────────────────────────────────────────────────
        credit_liabilities = liabilities.get('credit', []) or []
        avg_apr = 0
        if credit_liabilities:
            aprs = []
            for cl in credit_liabilities:
                for apr_item in (cl.get('aprs') or []):
                    v = apr_item.get('apr_percentage')
                    if v:
                        aprs.append(v)
            avg_apr = sum(aprs) / len(aprs) if aprs else 0

        credit_utilization = (total_credit_balance / total_credit_limit) if total_credit_limit > 0 else 0
        dti = (total_credit_balance / (monthly_income * 12)) if monthly_income > 0 else 0

        debt_score = 100
        debt_score -= min(40, dti * 125)
        debt_score -= min(25, credit_utilization * 62.5)
        if avg_apr > 20:
            debt_score -= min(15, (avg_apr - 20) * 1.5)
        debt_score = round(max(0, debt_score))

        # ── Spending pillar ─────────────────────────────────────────────
        by_month = {}
        for t in debits:
            try:
                m = datetime.strptime(t['date'], '%Y-%m-%d').month
                by_month[m] = by_month.get(m, 0) + t['amount']
            except Exception:
                pass

        monthly_totals = list(by_month.values())
        avg_month = sum(monthly_totals) / len(monthly_totals) if monthly_totals else 0
        months_over = sum(1 for v in monthly_totals if v > avg_month * 1.15)
        volatility = 'low'
        if len(monthly_totals) > 1:
            import statistics
            try:
                cv = statistics.stdev(monthly_totals) / avg_month if avg_month > 0 else 0
                if cv > 0.25:   volatility = 'high'
                elif cv > 0.12: volatility = 'moderate'
            except Exception:
                pass

        cat_sums = {}
        for t in debits:
            cat_sums[t['category']] = cat_sums.get(t['category'], 0) + t['amount']
        top_cat = max(cat_sums, key=cat_sums.get) if cat_sums else 'Other'

        spending_score = 100
        spending_score -= min(60, months_over * 20)
        if volatility == 'high':     spending_score -= 20
        elif volatility == 'moderate': spending_score -= 10
        spending_score = round(max(0, spending_score))

        # ── Literacy pillar (stub — no tracking yet) ────────────────────
        literacy_score = 50
        literacy_data  = {'score': literacy_score, 'detail': 'Literacy tracking coming soon', 'modulesCompleted': 5, 'modulesTotal': 12, 'lastActivityDays': 7}

        # ── Sapling pillar (investment accounts) ───────────────────────
        has_invest = len(invest_accs) > 0
        invest_balance = sum(acc_balance(a) for a in invest_accs)
        sapling_score = 0
        if has_invest:
            sapling_score += 20
            invest_txs = [t for t in transactions_90 if t['category'] == 'Savings & Investing']
            inv_months = set()
            for t in invest_txs:
                try:
                    inv_months.add(datetime.strptime(t['date'], '%Y-%m-%d').month)
                except Exception:
                    pass
            contribution_consistency = len(inv_months) / 3.0
            sapling_score += round(contribution_consistency * 35)
            monthly_invest = invest_balance / 12.0
            contrib_rate = min(30, (monthly_invest / monthly_income) * 300) if monthly_income > 0 else 0
            sapling_score += round(contrib_rate)
            sapling_score += min(15, len(invest_accs) * 7)
            sapling_score = min(100, sapling_score)

        # ── Composite score ─────────────────────────────────────────────
        health_score = round(
            savings_score  * 0.30 +
            debt_score     * 0.25 +
            spending_score * 0.25 +
            literacy_score * 0.20
        )

        # ── Stage ───────────────────────────────────────────────────────
        stages = [
            {'name': 'Bare Ground',   'min': 0,  'desc': 'Your financial journey has not started yet. Plant the first seed.'},
            {'name': 'First Seed',    'min': 15, 'desc': 'A seed has been planted. Small habits are beginning to take root.'},
            {'name': 'Young Sprout',  'min': 25, 'desc': 'Your sprout is fragile but growing. Protect it with consistent habits.'},
            {'name': 'Steady Sapling','min': 40, 'desc': 'Your roots are forming. Keep nurturing your habits.'},
            {'name': 'Young Tree',    'min': 55, 'desc': 'Growing strong. Your financial foundation is becoming solid.'},
            {'name': 'Mature Tree',   'min': 70, 'desc': 'A strong, leafy tree. Your money is working for you.'},
            {'name': 'Thriving Tree', 'min': 85, 'desc': 'Full canopy, deep roots. Financial confidence at its peak.'},
            {'name': 'Mighty Oak',    'min': 93, 'desc': 'Financial mastery. Your tree stands tall and endures all seasons.'},
        ]
        stage = next((s for s in reversed(stages) if health_score >= s['min']), stages[0])

        # ── Milestones ──────────────────────────────────────────────────
        unlocked = []
        if emergency_fund_months > 0:          unlocked.append('first-deposit')
        if literacy_data['modulesCompleted'] >= 1: unlocked.append('budget-set')
        if health_score >= 25:                 unlocked.append('debt-aware')
        if emergency_fund_months >= 1:         unlocked.append('ef-one-month')
        if has_invest:                          unlocked.append('sapling-planted')
        if health_score >= 40:                 unlocked.append('rate-reader')
        if has_consistent_deposits and health_score >= 50: unlocked.append('consistent-3mo')
        if emergency_fund_months >= 3:         unlocked.append('ef-three-month')
        if health_score >= 65:                 unlocked.append('debt-down')
        if health_score >= 70:                 unlocked.append('cu-conversation')
        if sapling_score >= 50:                unlocked.append('invest-growing')
        if health_score >= 85:                 unlocked.append('financial-plan')
        if health_score >= 93:                 unlocked.append('mighty-oak')

        return jsonify({
            'pillars': {
                'savings': {
                    'score': savings_score,
                    'detail': f"Emergency fund: {emergency_fund_months:.1f} months saved",
                    'monthlyContributionRate': round(monthly_savings_rate, 1),
                    'emergencyFundMonths': round(emergency_fund_months, 2),
                    'hasConsistentDeposits': has_consistent_deposits,
                },
                'debt': {
                    'score': debt_score,
                    'detail': 'Moderate debt load' if 30 <= debt_score < 70 else ('Low debt' if debt_score >= 70 else 'High debt load'),
                    'debtToIncomeRatio': round(dti, 3),
                    'averageAPR': round(avg_apr, 1),
                    'missedPayments': 0,
                    'creditUtilization': round(credit_utilization, 3),
                },
                'spending': {
                    'score': spending_score,
                    'detail': f"Top spend: {top_cat}",
                    'monthsOverBudget': months_over,
                    'topOverspendCategory': top_cat,
                    'spendingVolatility': volatility,
                },
                'literacy': literacy_data,
            },
            'sapling': {
                'score': sapling_score,
                'hasInvestmentAccount': has_invest,
                'contributionConsistency': round(len(inv_months) / 3.0, 2) if has_invest else 0,
                'accountTypes': [a.get('subtype', 'investment') for a in invest_accs],
                'totalInvestedBalance': round(invest_balance, 2),
                'monthlyContribution': round(invest_balance / 12.0, 2),
                'lastContributionDays': 0,
                'detail': f"${invest_balance:.0f} invested" if has_invest else 'No investment account',
            },
            'healthScore':       health_score,
            'stageName':         stage['name'],
            'stageDescription':  stage['desc'],
            'unlockedMilestones': unlocked,
        })
    except Exception as e:
        if 'PRODUCT_NOT_READY' in str(e):
            return jsonify({'pending': True}), 200
        print('tree-data error', e)
        import traceback; traceback.print_exc()
        return jsonify({'error': 'Failed to compute tree data'}), 500


if __name__ == "__main__":
    app.run(port=5000)
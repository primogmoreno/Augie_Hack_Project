from flask import Flask, jsonify, request, session
from flask_cors import CORS
from interfacer import PlaidClient
from google import genai
from google.genai import types as genai_types
import os
import json
from datetime import date, datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = "your-secret-key-here"  # change this to something random
CORS(app, supports_credentials=True)

plaid = PlaidClient()

_gemini_key = os.getenv("GEMINI_API_KEY")
gemini_client = genai.Client(api_key=_gemini_key) if _gemini_key else None

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

@app.route("/api/create_link_token", methods=["POST"])
def create_link_token():
    token = plaid.create_link_token(user_id="user-123")
    return jsonify({"link_token": token})

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
        transactions = plaid.get_transactions(access_token)
        return jsonify({'transactions': _serialize(transactions)})
    except Exception as e:
        err_str = str(e)
        if 'PRODUCT_NOT_READY' in err_str:
            return jsonify({'transactions': [], 'pending': True}), 200
        print('transactions error', e)
        return jsonify({'error': 'Failed to fetch transactions'}), 500

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

if __name__ == "__main__":
    app.run(port=5000)
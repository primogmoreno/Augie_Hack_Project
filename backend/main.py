from flask import Flask, jsonify, request, session
from flask_cors import CORS
from interfacer import PlaidClient


app = Flask(__name__)
app.secret_key = "your-secret-key-here"  # change this to something random
CORS(app, supports_credentials=True)

plaid = PlaidClient()

@app.route("/api/create_link_token", methods=["POST"])
def create_link_token():
    token = plaid.create_link_token(user_id="user-123")
    return jsonify({"link_token": token})

@app.route("/api/exchange_public_token", methods=["POST"])
def exchange_public_token():
    public_token = request.json.get("public_token")
    access_token, item_id = plaid.exchange_public_token(public_token)
    session['access_token'] = access_token  # save to session
    return jsonify({"access_token": access_token, "item_id": item_id})

@app.route('/api/accounts', methods=['GET'])
def get_accounts():
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({'error': 'Not connected'}), 401
    try:
        accounts = plaid.get_accounts(access_token)
        return jsonify({'accounts': accounts})
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
        return jsonify({'transactions': transactions})
    except Exception as e:
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
if __name__ == "__main__":
    app.run(port=5000)
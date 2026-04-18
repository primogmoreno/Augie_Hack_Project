import plaid
from plaid.api import plaid_api
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.liabilities_get_request import LiabilitiesGetRequest
from datetime import date, timedelta
from dotenv import load_dotenv
import os
load_dotenv()

class PlaidClient:
    def __init__(self):
        self.client_id = os.getenv("PLAID_CLIENT_ID")
        self.secret = os.getenv("PLAID_SECRET")
        self.environment = plaid.Environment.Sandbox

        configuration = plaid.Configuration(
            host=self.environment,
            api_key={
                "clientId": self.client_id,
                "secret": self.secret,
            }
        )
        api_client = plaid.ApiClient(configuration)
        self.client = plaid_api.PlaidApi(api_client)

    def create_link_token(self, user_id: str, client_name: str = "FinLit") -> str:
        """ Creates a link token for the frontend to initialize Plaid Link.
        Serves as Step 1 in the Plaid flow. The flask app will call this endpoint to get a link token, which is then sent to the frontend.
        """
        request = LinkTokenCreateRequest(
            products=[Products("transactions"), Products("liabilities")],
            client_name=client_name,
            country_codes=[CountryCode("US")],
            language="en",
            user=LinkTokenCreateRequestUser(
                client_user_id=user_id
            )
        )
        response = self.client.link_token_create(request)
        return response["link_token"]

    def exchange_public_token(self, public_token: str) -> tuple[str, str]:
        """ Exchanges a public token for an access token and item ID.
        Serves as Step 2 in the Plaid flow. The flask app will call this endpoint after receiving a public token from the frontend.
        """

        request = ItemPublicTokenExchangeRequest(public_token=public_token)
        response = self.client.item_public_token_exchange(request)
        return response["access_token"], response["item_id"]

    def get_transactions(self, access_token: str, start_date: date = None, end_date: date = None) -> list:
        """ Fetches the last 90 days of transactions for the given access token."""
        if start_date is None:
            start_date = date.today() - timedelta(days=90)
        if end_date is None:
            end_date = date.today()
        request = TransactionsGetRequest(
            access_token=access_token,
            start_date=start_date,
            end_date=end_date,
        )
        response = self.client.transactions_get(request)
        print(response)  # For debugging purposes, you can remove this in production
        return response["transactions"]
    
    def get_accounts(self, access_token: str) -> list:
        request = AccountsGetRequest(access_token=access_token)
        response = self.client.accounts_get(request)
        return response["accounts"]

    def get_liabilities(self, access_token: str) -> dict:
        request = LiabilitiesGetRequest(access_token=access_token)
        response = self.client.liabilities_get(request)
        return response["liabilities"]

import requests
import base64
from datetime import datetime
from pydantic_settings import BaseSettings
import logging

logger = logging.getLogger(__name__)

class PaymentSettings(BaseSettings):
    MPESA_CONSUMER_KEY: str = "your_consumer_key"
    MPESA_CONSUMER_SECRET: str = "your_consumer_secret"
    MPESA_BUSINESS_SHORTCODE: str = "174379"
    MPESA_PASSKEY: str = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
    MPESA_ENVIRONMENT: str = "sandbox" # sandbox or production
    MPESA_CALLBACK_URL: str = "https://your-domain.com/api/v1/payments/webhook"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = PaymentSettings()

class MpesaGateway:
    def __init__(self):
        self.base_url = (
            "https://sandbox.safaricom.co.ke" 
            if settings.MPESA_ENVIRONMENT == "sandbox" 
            else "https://api.safaricom.co.ke"
        )
    
    def get_access_token(self) -> str:
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        auth = requests.auth.HTTPBasicAuth(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET)
        
        try:
            response = requests.get(url, auth=auth, timeout=10)
            response.raise_for_status()
            return response.json().get("access_token")
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get Mpesa access token: {e}")
            raise Exception("Payment gateway error")

    def initiate_stk_push(self, phone_number: str, amount: int, account_reference: str, transaction_desc: str):
        access_token = self.get_access_token()
        url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        password_str = f"{settings.MPESA_BUSINESS_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}"
        password = base64.b64encode(password_str.encode()).decode()
        
        # Format phone number to start with 254
        if phone_number.startswith("0"):
            phone_number = "254" + phone_number[1:]
        elif phone_number.startswith("+"):
            phone_number = phone_number[1:]
            
        payload = {
            "BusinessShortCode": settings.MPESA_BUSINESS_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone_number,
            "PartyB": settings.MPESA_BUSINESS_SHORTCODE,
            "PhoneNumber": phone_number,
            "CallBackURL": settings.MPESA_CALLBACK_URL,
            "AccountReference": account_reference,
            "TransactionDesc": transaction_desc
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"STK Push failed: {e}")
            if e.response is not None:
                logger.error(f"Response: {e.response.text}")
            raise Exception("Payment initiation failed")

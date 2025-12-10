from fastapi import APIRouter, HTTPException ,Request
from pydantic import BaseModel
import base64
import json
import hashlib
import requests
import time
 
router = APIRouter()

# -----------------------------
#   PHONEPE SANDBOX KEYS
# -----------------------------
MERCHANT_ID = "PGTESTPAYUAT86"
SALT_KEY = "96434309-7796-489d-8924-ab56988a6076"
SALT_INDEX = 1

PHONEPE_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox"

# -----------------------------
#   REQUEST BODY MODEL
# -----------------------------
class PaymentRequest(BaseModel):
    amount: int        # paise me (e.g., ₹100 → 10000)
    customer_id: int
    shipping_address: dict | None = None


# -----------------------------
#   CREATE PAYMENT
# -----------------------------
@router.post("/create-payment")
def create_payment(data: PaymentRequest):

    merchant_transaction_id = "TXN" + str(int(time.time() * 1000))
    print(merchant_transaction_id)
    
    merchant_order_id = "ORDER" + str(int(time.time()))

    payload = {
        "merchantId": MERCHANT_ID,
        "merchantTransactionId": merchant_transaction_id,
        "merchantOrderId": merchant_order_id,
        "amount": data.amount,
        # "redirectUrl": f"http://localhost:3001/order-success?txnId={merchant_transaction_id}",
        "redirectUrl": f"http://localhost:3000/phonepe-success?txnId={merchant_transaction_id}",
        "redirectMode": "REDIRECT",
        "callbackUrl": "http://localhost:3000/phonepe-success", 
        "paymentInstrument": {
            "type": "UPI_INTENT"
        }
    }

    json_payload = json.dumps(payload)
    base64_payload = base64.b64encode(json_payload.encode()).decode()

    api_path = "/pg/v1/pay"

    checksum_str = base64_payload + api_path + SALT_KEY
    checksum = hashlib.sha256(checksum_str.encode()).hexdigest()

    x_verify = f"{checksum}###{SALT_INDEX}"

    try:
        response = requests.post(
            PHONEPE_BASE_URL + api_path,
            json={"request": base64_payload},
            headers={
                "Content-Type": "application/json",
                "X-VERIFY": x_verify,
                "X-MERCHANT-ID": MERCHANT_ID,
            }
        )

        res = response.json()

        # If payment URL available
        if "data" in res and "instrumentResponse" in res["data"]:
            redirect_url = res["data"]["instrumentResponse"]["redirectInfo"]["url"]
            return {
                "success": True,
                "redirectUrl": redirect_url,
                "txnId": merchant_transaction_id
            }

        return {
            "success": False,
            "error": res
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/payment-status/{txn_id}")
def payment_status(txn_id: str):

    api_path = f"/pg/v1/status/{MERCHANT_ID}/{txn_id}"

    # SHA256(apiPath + SALT_KEY)
    checksum = hashlib.sha256(
        f"{api_path}{SALT_KEY}".encode()
    ).hexdigest()

    x_verify = f"{checksum}###{SALT_INDEX}"

    try:
        response = requests.get(
            PHONEPE_BASE_URL + api_path,
            headers={"X-VERIFY": x_verify}
        )

        return response.json()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/phonepe-callback")
def phonepe_callback(data: dict):
    print("📩 PhonePe Callback Received:", data)

    return {
        "success": True,
        "message": "Callback received",
        "data": data
    }



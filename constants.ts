
// constants.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
console.log(API_BASE_URL)
export const GET_PRODUCTS_API = `${API_BASE_URL}/products?skip=0&limit=100`;
export const GET_QUOTES_API = `${API_BASE_URL}/quotes`;
export const CREATE_QUOTES_API = `${API_BASE_URL}/create_quotes`;
export const CUSTOMERS_API = `${API_BASE_URL}/customers`;
export const SEND_OTP_API = `${API_BASE_URL}/send-otp`;
export const SINGUP_API = `${API_BASE_URL}/signup`;
export const LOGIN_API = `${API_BASE_URL}/login`;
export const VERIFY_OTP_API = `${API_BASE_URL}/verify-otp`;
export const PLACE_ORDER = `${API_BASE_URL}/place-order`;
export const APPLY_COUPON = `${GET_QUOTES_API}/apply-coupon`;
export const CANCEL_COUPON = `${GET_QUOTES_API}/cancel-coupon`;
export const ORDERS_API_URL = `${API_BASE_URL}/orders`;



 


 
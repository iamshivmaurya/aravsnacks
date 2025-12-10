"use client";

interface PaymentMethodSelectorProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

export default function PaymentMethodSelector({
  paymentMethod,
  setPaymentMethod,
}: PaymentMethodSelectorProps) {
  return (
    <div className="border rounded-lg p-4 mt-4">
      <h2 className="font-semibold mb-2">Payment Method</h2>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={paymentMethod === "cod"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Cash on Delivery
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="payment"
            value="phonepe"
            checked={paymentMethod === "phonepe"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Pay Online (PhonePe / UPI)
        </label>
      </div>
    </div>
  );
}

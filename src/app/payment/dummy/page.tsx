"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function DummyPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(async () => {
      try {
        // Get order ID from session/localStorage
        const orderData = sessionStorage.getItem("lastOrder");
        console.log("Order data from session:", orderData);
        
        if (!orderData) {
          alert("Order data not found");
          setIsProcessing(false);
          return;
        }

        const { orderId } = JSON.parse(orderData);
        console.log("Processing payment for orderId:", orderId);

        // Simulate payment success
        const response = await fetch("/api/payment/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            status: "settlement",
            paymentMethod,
          }),
        });

        console.log("Payment update response:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Payment updated successfully:", data);
          // Redirect to payment status page
          window.location.href = `/payment/status?orderId=${orderId}`;
        } else {
          const errorData = await response.json();
          console.error("Payment update failed:", errorData);
          alert("Payment failed: " + errorData.message);
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Payment error:", error);
        alert("Payment failed: " + (error instanceof Error ? error.message : "Unknown error"));
        setIsProcessing(false);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-100 rounded-full p-3 mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h10m4 0a1 1 0 11-2 0m2 0a1 1 0 10-2 0m-12 0a1 1 0 11-2 0m2 0a1 1 0 10-2 0"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dummy Payment Gateway
          </h1>
          <p className="text-gray-600 text-sm">
            ℹ️ This is a testing mode (no real payment processed)
          </p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3 mb-8">
          <h2 className="text-lg font-semibold text-gray-900">
            Select Payment Method
          </h2>

          {[
            { id: "credit_card", label: "💳 Kartu Kredit/Debit", icon: "🏦" },
            { id: "bank_transfer", label: "🏦 Transfer Bank", icon: "💰" },
            { id: "gopay", label: "📱 GoPay", icon: "📲" },
            { id: "ovo", label: "🟠 OVO", icon: "🔵" },
            { id: "dana", label: "📘 DANA", icon: "📱" },
          ].map((method) => (
            <label
              key={method.id}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                paymentMethod === method.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-3 text-gray-900 font-medium">
                {method.label}
              </span>
            </label>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-yellow-800">
            <strong>Test Token:</strong> {token?.slice(0, 20)}...
          </p>
          <p className="text-xs text-yellow-700 mt-2">
            Click &quot;Bayar Sekarang&quot; to simulate payment success. Payment will be marked as completed.
          </p>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full py-3 rounded-lg font-semibold text-white transition ${
            isProcessing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Bayar Sekarang"
          )}
        </button>

        {/* Cancel Link */}
        <button
          onClick={() => router.back()}
          className="w-full mt-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
        >
          Batal
        </button>

        {/* Footer Info */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            🚀 This is a dummy/mock payment interface for testing purposes
          </p>
          <p className="text-xs text-gray-500 mt-1">
            To use real Midtrans payment, add keys to .env.local
          </p>
        </div>
      </div>
    </div>
  );
}

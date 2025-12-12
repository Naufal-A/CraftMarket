"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

interface CartItem {
  _id?: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  sellerId?: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

const PAYMENT_METHODS = [
  { id: "credit_card", label: "Kartu Kredit/Debit", icon: "💳" },
  { id: "gopay", label: "GoPay", icon: "🏦" },
  { id: "bank_transfer", label: "Transfer Bank", icon: "🏧" },
  { id: "ovo", label: "OVO", icon: "💰" },
  { id: "dana", label: "DANA", icon: "📱" },
  { id: "qris", label: "QRIS", icon: "📲" },
];

const PROVINCES = [
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Yogyakarta",
  "Banten",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Jambi",
  "Sumatera Selatan",
  "Bengkulu",
  "Lampung",
  "Bangka Belitung",
  "Riau Islands",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "North Kalimantan",
  "Sulawesi Utara",
  "Sulawesi Tengah",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Gorontalo",
  "Sulawesi Barat",
  "Bali",
  "West Nusa Tenggara",
  "East Nusa Tenggara",
  "Papua",
  "West Papua",
  "Maluku",
  "North Maluku",
];

function CheckoutPageContent() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<"shipping" | "payment">(
    "shipping"
  );

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("gopay");
  const [orderError, setOrderError] = useState("");

  // Load cart and user data
  useEffect(() => {
    const loadCheckoutData = async () => {
      console.log("[Checkout] useEffect: loadCheckoutData started");
      try {
        const storedUserId = localStorage.getItem("userId");
        console.log("[Checkout] Stored userId from localStorage:", storedUserId);
        setUserId(storedUserId);

        if (!storedUserId) {
          console.warn("[Checkout] No userId found, redirecting to login");
          router.push("/login");
          return;
        }

        // Load cart from database
        console.log("[Checkout] Fetching cart for buyerId:", storedUserId);
        const response = await fetch(`/api/cart?buyerId=${storedUserId}`);
        console.log("[Checkout] Cart API response status:", response.status);
        
        if (response.ok) {
          const cart = await response.json();
          console.log("[Checkout] Cart data received:", cart);
          
          let mappedItems = (cart.items || []).map(
            (item: Record<string, unknown>) => ({
              ...item,
              _id: (item._id as string) || (item.productId as string),
              name: (item.name as string) || (item.productName as string),
            })
          );
          
          // Fetch seller info for items without sellerId
          const itemsNeedingSeller = mappedItems.filter(
            (item: CartItem) => !item.sellerId
          );
          
          if (itemsNeedingSeller.length > 0) {
            console.log("[Checkout] Fetching seller info for items without sellerId");
            const productsRes = await fetch("/api/products");
            if (productsRes.ok) {
              const productsData = await productsRes.json();
              const productMap = new Map(
                (productsData.products || []).map((p: Record<string, unknown>) => [
                  p._id,
                  p,
                ])
              );
              
              mappedItems = mappedItems.map((item: CartItem) => {
                if (!item.sellerId) {
                  const product = productMap.get(item.productId || item._id);
                  if (product && (product as Record<string, unknown>).sellerId) {
                    item.sellerId = (product as Record<string, unknown>).sellerId as string;
                    console.log(
                      `[Checkout] Added sellerId for product ${item.productId}: ${item.sellerId}`
                    );
                  }
                }
                return item;
              });
            }
          }
          
          console.log("[Checkout] Mapped cart items:", mappedItems);
          setCartItems(mappedItems as CartItem[]);
        } else {
          console.error("[Checkout] Failed to fetch cart:", response.status);
        }
      } catch (err) {
        console.error("[Checkout] Error loading checkout data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutData();
  }, [router]);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const shipping = cartItems.length > 0 ? 50000 : 0;
  const total = subtotal + tax + shipping;

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinueToPayment = () => {
    // Validate shipping address
    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.province ||
      !shippingAddress.postalCode
    ) {
      setOrderError("Semua field alamat pengiriman harus diisi");
      return;
    }

    setOrderError("");
    setCurrentStep("payment");
  };

  const handleCreateOrder = async () => {
    console.log("[handleCreateOrder] Starting order creation");
    console.log("[handleCreateOrder] userId:", userId);
    console.log("[handleCreateOrder] cartItems count:", cartItems.length);
    console.log("[handleCreateOrder] cartItems:", cartItems);
    console.log("[handleCreateOrder] shippingAddress:", shippingAddress);
    
    if (!userId || cartItems.length === 0) {
      console.error("[handleCreateOrder] Missing data - userId:", userId, "cartItems:", cartItems.length);
      setOrderError("Data tidak lengkap");
      return;
    }

    setProcessing(true);
    setOrderError("");

    try {
      // Validate that all items are from the same seller
      const sellerIds = cartItems.map(item => item.sellerId).filter(Boolean);
      console.log("[handleCreateOrder] Seller IDs in cart:", sellerIds);
      
      const uniqueSellers = new Set(sellerIds);
      if (uniqueSellers.size > 1) {
        console.error("[handleCreateOrder] Multiple sellers in cart");
        setOrderError("Keranjang Anda berisi produk dari penjual berbeda. Silakan pisahkan pesanan.");
        setProcessing(false);
        return;
      }

      // Get seller ID from cart items
      const sellerId = cartItems[0]?.sellerId;
      console.log("[handleCreateOrder] Using sellerId:", sellerId);
      
      if (!sellerId) {
        console.error("[handleCreateOrder] No sellerId found in cart items");
        setOrderError("Informasi penjual tidak ditemukan");
        setProcessing(false);
        return;
      }

      const paymentBody = {
        buyerId: userId,
        items: cartItems,
        totalPrice: total,
        shippingAddress,
        paymentMethod: selectedPaymentMethod,
        sellerId: sellerId,
      };
      
      console.log("[handleCreateOrder] Sending payment request with body:", paymentBody);
      
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentBody),
      });

      const data = await response.json();
      console.log("[handleCreateOrder] Payment create response:", { status: response.status, data });

      if (!response.ok) {
        console.error("[handleCreateOrder] Payment failed:", data.message);
        setOrderError(data.message || "Gagal membuat pesanan");
        setProcessing(false);
        return;
      }

      // Store order ID for status tracking
      const orderId = data.order?.orderId;
      console.log("[handleCreateOrder] Order created with ID:", orderId);
      
      if (!orderId) {
        console.error("[handleCreateOrder] No orderId in response");
        setOrderError("Order ID tidak ditemukan dalam response");
        setProcessing(false);
        return;
      }

      localStorage.setItem("lastOrderId", orderId);

      // Update product quantities and clear cart
      try {
        console.log("[handleCreateOrder] Updating product quantities...");
        
        // Decrease each product quantity
        for (const item of cartItems) {
          const productId = item.productId || item._id;
          console.log("[handleCreateOrder] Decreasing quantity for product:", productId, "by:", item.quantity);
          
          const decreaseResponse = await fetch(`/api/products/${productId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              decreaseQuantity: item.quantity,
            }),
          });

          if (decreaseResponse.ok) {
            console.log("[handleCreateOrder] Successfully decreased product", productId);
          } else {
            console.warn("[handleCreateOrder] Failed to decrease product", productId);
          }
        }

        // Clear all cart items from database
        console.log("[handleCreateOrder] Clearing cart for userId:", userId);
        const clearCartResponse = await fetch(`/api/cart?buyerId=${userId}&clearAll=true`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (clearCartResponse.ok) {
          console.log("[handleCreateOrder] Cart cleared successfully");
          setCartItems([]); // Clear local state
          // Trigger cart update event
          window.dispatchEvent(new CustomEvent("cartUpdated", { detail: [] }));
        } else {
          console.warn("[handleCreateOrder] Failed to clear cart");
        }
      } catch (err) {
        console.warn("[handleCreateOrder] Warning: Could not update inventory:", err);
        // Don't fail the checkout if inventory update fails
        setCartItems([]);
      }

      // Redirect langsung ke orders page (pembayaran sudah automatic settlement)
      console.log("[handleCreateOrder] Redirecting to orders page...");
      router.push(`/orders`);
    } catch (err) {
      console.error("[handleCreateOrder] Error creating order:", err);
      setOrderError("Terjadi kesalahan saat membuat pesanan");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header cartCount={cartItems.length} />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-800 text-lg">Memuat checkout...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Header cartCount={0} />
        <main className="min-h-screen bg-gray-50">
          <section className="bg-gradient-to-r from-[#8C735A] to-[#A68E74] text-white py-8 px-6 border-none">
            <div className="max-w-6xl mx-auto flex items-center gap-4">
              <Link href="/cart" className="hover:opacity-80">
                <ArrowLeft size={24} />
              </Link>
              <h1 className="text-3xl font-bold">Checkout</h1>
            </div>
          </section>

          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Keranjang Anda Kosong
              </h2>
              <p className="text-gray-800 mb-6">
                Tidak ada item untuk di checkout
              </p>
              <Link
                href="/products"
                className="inline-block bg-[#8C735A] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#7A6248] transition"
              >
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header cartCount={cartItems.length} />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-r from-[#8C735A] to-[#A68E74] text-white py-8 px-6 border-none">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <Link href="/cart" className="hover:opacity-80">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Progress Steps */}
          <div className="mb-12 flex items-center justify-center gap-4">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition ${
                currentStep === "shipping"
                  ? "bg-[#8C735A] text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              {currentStep !== "shipping" ? "✓" : "1"}
            </div>
            <div
              className={`h-1 w-24 transition ${
                currentStep === "payment" ? "bg-[#8C735A]" : "bg-gray-400"
              }`}
            />
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition ${
                currentStep === "payment"
                  ? "bg-[#8C735A] text-white"
                  : "bg-gray-400 text-gray-800"
              }`}
            >
              2
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {currentStep === "shipping" ? (
                <ShippingForm
                  address={shippingAddress}
                  onChange={handleAddressChange}
                  onContinue={handleContinueToPayment}
                  error={orderError}
                />
              ) : (
                <PaymentForm
                  method={selectedPaymentMethod}
                  onMethodChange={setSelectedPaymentMethod}
                  onCreateOrder={handleCreateOrder}
                  processing={processing}
                  error={orderError}
                  onBack={() => setCurrentStep("shipping")}
                />
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Ringkasan Pesanan
                </h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between text-sm text-gray-900"
                    >
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>
                        Rp{(item.price * item.quantity).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-900">
                    <span>Subtotal:</span>
                    <span>Rp{subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-gray-900">
                    <span>Pajak (10%):</span>
                    <span>Rp{tax.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-gray-900">
                    <span>Biaya Pengiriman:</span>
                    <span>Rp{shipping.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="text-lg font-bold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-[#8C735A]">
                    Rp{total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute requiredRole="buyer">
      <CheckoutPageContent />
    </ProtectedRoute>
  );
}

// Shipping Form Component
function ShippingForm({
  address,
  onChange,
  onContinue,
  error,
}: {
  address: ShippingAddress;
  onChange: (field: keyof ShippingAddress, value: string) => void;
  onContinue: () => void;
  error: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Alamat Pengiriman
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={address.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="Masukkan nama lengkap"
            className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#8C735A] focus:border-transparent outline-none transition text-gray-900 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nomor Telepon
          </label>
          <input
            type="tel"
            value={address.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="Contoh: 08123456789"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C735A] focus:border-transparent outline-none transition text-gray-900 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alamat Lengkap
          </label>
          <textarea
            value={address.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Jalan, nomor rumah, blok, etc"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C735A] focus:border-transparent outline-none transition text-gray-900 bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provinsi
            </label>
            <select
              value={address.province}
              onChange={(e) => onChange("province", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C735A] focus:border-transparent outline-none transition text-gray-900 bg-white"
            >
              <option value="">Pilih Provinsi</option>
              {PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kota
            </label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => onChange("city", e.target.value)}
              placeholder="Masukkan nama kota"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C735A] focus:border-transparent outline-none transition text-gray-900 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kode Pos
          </label>
          <input
            type="text"
            value={address.postalCode}
            onChange={(e) => onChange("postalCode", e.target.value)}
            placeholder="Contoh: 12345"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8C735A] focus:border-transparent outline-none transition text-gray-900 bg-white"
          />
        </div>

        <button
          onClick={onContinue}
          className="w-full bg-[#8C735A] text-white py-3 rounded-lg font-bold hover:bg-[#7A6248] transition"
        >
          Lanjut ke Pembayaran
        </button>
      </div>
    </div>
  );
}

// Payment Form Component
function PaymentForm({
  method,
  onMethodChange,
  onCreateOrder,
  processing,
  error,
  onBack,
}: {
  method: string;
  onMethodChange: (method: string) => void;
  onCreateOrder: () => void;
  processing: boolean;
  error: string;
  onBack: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Metode Pembayaran
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3 mb-8">
        {PAYMENT_METHODS.map((pm) => (
          <label
            key={pm.id}
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
              method === pm.id
                ? "border-[#8C735A] bg-orange-50"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <input
              type="radio"
              name="payment-method"
              value={pm.id}
              checked={method === pm.id}
              onChange={(e) => onMethodChange(e.target.value)}
              className="w-4 h-4 text-[#8C735A] cursor-pointer"
            />
            <span className="text-2xl ml-4">{pm.icon}</span>
            <span className="ml-3 font-medium text-gray-800">{pm.label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          disabled={processing}
          className="flex-1 border-2 border-gray-400 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-50 transition disabled:opacity-50"
        >
          Kembali
        </button>
        <button
          onClick={onCreateOrder}
          disabled={processing}
          className="flex-1 bg-[#8C735A] text-white py-3 rounded-lg font-bold hover:bg-[#7A6248] transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {processing && <Loader2 size={20} className="animate-spin" />}
          {processing ? "Memproses..." : "Buat Pesanan"}
        </button>
      </div>
    </div>
  );
}

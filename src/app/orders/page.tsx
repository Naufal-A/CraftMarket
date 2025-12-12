"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  customizationDetails?: {
    material?: string;
    color?: string;
    design?: string;
  };
}

interface Order {
  _id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  items: OrderItem[];
  totalPrice: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  createdAt: string;
}

const statusConfig = {
  pending: { label: "Menunggu Pembayaran", color: "bg-amber-100 text-amber-900", icon: "⏳" },
  processing: { label: "Diproses", color: "bg-orange-100 text-orange-900", icon: "⚙️" },
  shipped: { label: "Dikirim", color: "bg-yellow-100 text-yellow-900", icon: "📦" },
  delivered: { label: "Terima", color: "bg-green-100 text-green-900", icon: "✓" },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-900", icon: "✗" },
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    // Get user ID from localStorage
    const user = localStorage.getItem("user");
    const userId = localStorage.getItem("userId");
    
    if (userId) {
      setUserId(userId);
      console.log("User ID loaded:", userId);
    } else if (user) {
      try {
        const parsedUser = JSON.parse(user);
        const id = parsedUser._id || parsedUser.id;
        if (id) {
          setUserId(id);
          console.log("User ID loaded from user object:", id);
        } else {
          setError("User ID tidak ditemukan");
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to parse user:", e);
        setError("Failed to load user info");
        setLoading(false);
      }
    } else {
      setError("User tidak terdeteksi. Silakan login terlebih dahulu");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      console.log("Waiting for userId...");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        
        const url = selectedStatus === "all"
          ? `/api/orders?buyerId=${userId}`
          : `/api/orders?buyerId=${userId}&status=${selectedStatus}`;
        
        console.log("Fetching orders from:", url);
        
        const response = await fetch(url);
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch orders");
        }

        const data = await response.json();
        console.log("Orders data received:", data);
        setOrders(data.orders || []);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load orders";
        console.error("Error fetching orders:", errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, selectedStatus]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-700 font-medium">Memuat pesanan...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F4EFEA] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => router.push("/home")}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#8C735A] text-white hover:bg-[#7A6248] transition"
                title="Kembali ke Home"
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            <h1 className="text-4xl font-serif text-[#8C735A] font-bold mb-2">Pesanan Saya</h1>
            <p className="text-gray-700">Lacak status dan riwayat pesanan Anda</p>
          </div>

          {/* Status Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-t-4 border-[#8C735A]">
            <h2 className="text-sm font-semibold text-[#8C735A] mb-3">Filter Status</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus("all")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedStatus === "all"
                    ? "bg-[#8C735A] text-white"
                    : "bg-[#E8DCC8] text-[#8C735A] hover:bg-[#D9CCBA]"
                }`}
              >
                Semua
              </button>
              {Object.entries(statusConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedStatus(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedStatus === key
                      ? "bg-[#8C735A] text-white"
                      : "bg-[#E8DCC8] text-[#8C735A] hover:bg-[#D9CCBA]"
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-2xl font-bold text-[#8C735A] mb-2">Tidak ada pesanan</h2>
              <p className="text-gray-700 mb-6">
                {selectedStatus === "all"
                  ? "Anda belum membuat pesanan. Mulai belanja sekarang!"
                  : "Tidak ada pesanan dengan status ini."}
              </p>
              <Link
                href="/products"
                className="inline-block bg-[#8C735A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#7A6248] transition"
              >
                Belanja Sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const config = statusConfig[order.status];
                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="p-4 sm:p-6 bg-[#F9F6F3] border-b-4 border-[#8C735A]">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-[#8C735A] text-lg">{order.orderId}</h3>
                          <p className="text-gray-700 text-sm mt-1">
                            {new Date(order.createdAt).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className={`px-4 py-2 rounded-lg font-semibold w-fit ${config.color}`}>
                          {config.icon} {config.label}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4 sm:p-6 border-b border-[#E8DCC8]">
                      <h4 className="font-semibold text-[#8C735A] mb-3">Item Pesanan</h4>
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 sm:gap-4">
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.productName}
                                width={80}
                                height={80}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {item.productName}
                              </p>
                              <p className="text-gray-700 text-sm">
                                Qty: {item.quantity} × Rp {item.price.toLocaleString("id-ID")}
                              </p>
                              {item.customizationDetails && (
                                <div className="text-gray-500 text-xs mt-1 space-y-0.5">
                                  {item.customizationDetails.material && (
                                    <p>Material: {item.customizationDetails.material}</p>
                                  )}
                                  {item.customizationDetails.color && (
                                    <p>Warna: {item.customizationDetails.color}</p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-gray-700">
                          <span>Subtotal</span>
                          <span>Rp {order.totalPrice.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-[#8C735A] text-lg pt-2 border-t border-[#E8DCC8]">
                          <span>Total</span>
                          <span>Rp {order.totalPrice.toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address & Tracking */}
                    <div className="p-4 sm:p-6 grid sm:grid-cols-2 gap-6 border-b border-[#E8DCC8]">
                      <div>
                        <h4 className="font-semibold text-[#8C735A] mb-2">Alamat Pengiriman</h4>
                        <div className="text-gray-700 text-sm space-y-1">
                          <p>{order.shippingAddress.fullName}</p>
                          <p>{order.shippingAddress.address}</p>
                          <p>
                            {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                            {order.shippingAddress.postalCode}
                          </p>
                          <p className="pt-1 text-gray-500">{order.shippingAddress.phone}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#8C735A] mb-2">Metode Pembayaran</h4>
                        <p className="text-gray-700 text-sm mb-4 capitalize">{order.paymentMethod}</p>
                        {order.trackingNumber && (
                          <div>
                            <h4 className="font-semibold text-[#8C735A] mb-2">Nomor Resi</h4>
                            <p className="text-gray-700 text-sm font-mono bg-[#F9F6F3] p-2 rounded border border-[#E8DCC8]">
                              {order.trackingNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="p-4 sm:p-6 bg-[#F9F6F3] border-t border-[#E8DCC8]">
                      <h4 className="font-semibold text-[#8C735A] mb-6">Status Pesanan</h4>
                      {(() => {
                        const statuses = ["pending", "processing", "shipped", "delivered"];
                        const currentStatusIndex = statuses.indexOf(order.status);
                        
                        return (
                          <div className="flex items-center justify-between relative">
                            {/* Background connector line */}
                            <div className="absolute top-5 left-5 right-5 h-1 bg-gray-300 -z-10" />
                            <div 
                              className="absolute top-5 left-5 h-1 bg-[#8C735A] -z-10 transition-all duration-500"
                              style={{ width: `${Math.max(0, (currentStatusIndex + 1) * 25 - 5)}%` }}
                            />

                            {statuses.map((step, idx) => {
                              const isCompleted = currentStatusIndex >= idx;
                              const isActive = currentStatusIndex === idx;
                              
                              return (
                                <div key={step} className="flex flex-col items-center relative z-10 flex-1">
                                  {/* Step Circle */}
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mb-3 transition-all shadow-md ${
                                      isCompleted
                                        ? "bg-[#8C735A]"
                                        : isActive
                                        ? "bg-[#A68E74] animate-pulse shadow-lg"
                                        : "bg-gray-300"
                                    }`}
                                  >
                                    {isCompleted ? "✓" : idx + 1}
                                  </div>
                                  
                                  {/* Step Label */}
                                  <p className={`text-xs text-center font-semibold whitespace-nowrap px-1 ${
                                    isActive ? "text-[#8C735A]" : isCompleted ? "text-[#8C735A]" : "text-gray-500"
                                  }`}>
                                    {statusConfig[step as keyof typeof statusConfig].label}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => router.push(`/payment/status?orderId=${order.orderId}`)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        Lihat Detail
                      </button>
                      {order.status === "pending" && (
                        <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition">
                          Batalkan Pesanan
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

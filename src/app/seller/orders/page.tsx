"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader,
  LayoutDashboard,
  ShoppingCart,
  PackageSearch,
  LogOut,
} from "lucide-react";
import Image from "next/image";

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  _id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
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
  createdAt: string;
  updatedAt: string;
}

const statusTransitions: Record<string, string[]> = {
  pending: ["processing"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const statusColors: Record<string, string> = {
  pending: "bg-gray-200 text-gray-800",
  processing: "bg-yellow-200 text-yellow-800",
  shipped: "bg-blue-200 text-blue-800",
  delivered: "bg-green-200 text-green-800",
  cancelled: "bg-red-200 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "Tertunda",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
};

export default function SellerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [active, setActive] = useState("orders");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    console.log("[Seller Orders] User string:", userStr);
    
    if (!userStr) {
      router.push("/seller/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      console.log("[Seller Orders] Parsed user:", user);
      console.log("[Seller Orders] User ID:", user._id);
      console.log("[Seller Orders] User role:", user.role);
      
      if (user.role === "seller") {
        setIsAuthorized(true);
        fetchOrders(user._id);
      } else {
        router.push("/seller/register");
      }
    } catch (error) {
      console.error("Error parsing user:", error);
      router.push("/seller/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const fetchOrders = async (sellerId: string) => {
    try {
      console.log(`[Seller Orders] Fetching orders for seller: ${sellerId}`);
      const response = await fetch(`/api/orders?sellerId=${sellerId}`);
      console.log(`[Seller Orders] Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[Seller Orders] Received ${data.orders?.length || 0} orders:`, data.orders);
        setOrders(data.orders || []);
      } else {
        console.error(`[Seller Orders] API error: ${response.status}`);
        const errorData = await response.json();
        console.error("Error data:", errorData);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus as "pending" | "processing" | "shipped" | "delivered" | "cancelled" } : order
          )
        );
      } else {
        alert("Gagal mengubah status pesanan");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Terjadi kesalahan");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/seller/login");
  };

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#F4EFEA] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8C735A] mx-auto mb-4"></div>
          <p className="text-[#4A3B32]">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#F4EFEA]">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-[#DCC8B9] h-full p-8 flex flex-col shadow-md">
        <div className="text-xl font-bold text-[#4A3B32] mb-8 tracking-wide">
          Marketplace Dashboard
        </div>

        <div className="flex flex-col gap-3 text-[#4A3B32] font-medium">
          {[
            { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
            { key: "orders", label: "Orders", icon: <ShoppingCart size={18} /> },
            { key: "products", label: "Products", icon: <PackageSearch size={18} /> },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActive(item.key);
                if (item.key === "dashboard") {
                  router.push("/seller/dasboard");
                } else if (item.key === "products") {
                  router.push("/seller/products");
                } else if (item.key === "orders") {
                  router.push("/seller/orders");
                }
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                active === item.key
                  ? "bg-white shadow-sm text-[#3B2E27]"
                  : "hover:bg-white/40"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/seller/dasboard")}
            className="flex items-center gap-2 text-[#4A3B32] hover:text-[#8C735A] transition"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>
          <h1 className="text-3xl font-bold text-[#4A3B32]">Kelola Pesanan</h1>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition ${
                  selectedStatus === status
                    ? "bg-[#8C735A] text-white"
                    : "bg-white text-[#4A3B32] border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {status === "all" ? "Semua" : statusLabels[status]}
              </button>
            )
          )}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {/* Debug info when no orders */}
          {orders.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800 font-semibold mb-1">Belum ada pesanan</p>
              <p className="text-xs text-yellow-700">Periksa console browser untuk debug info (F12)</p>
            </div>
          )}
          
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[#4A3B32]">
                          {order.orderId}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Pembeli: {order.buyerName} ({order.buyerEmail})
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#8C735A] mb-2">
                      Rp {order.totalPrice.toLocaleString("id-ID")}
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 border-b border-gray-200">
                  <h4 className="font-semibold text-[#4A3B32] mb-4">
                    Item Pesanan
                  </h4>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        {item.image && (
                          <div className="relative w-20 h-20 flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.productName}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-[#4A3B32]">
                            {item.productName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Rp {item.price.toLocaleString("id-ID")} x {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-[#8C735A] mt-1">
                            Subtotal: Rp{" "}
                            {(item.price * item.quantity).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="p-6 border-b border-gray-200">
                  <h4 className="font-semibold text-[#4A3B32] mb-3">
                    Alamat Pengiriman
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p className="font-medium mt-2">
                      📞 {order.shippingAddress.phone}
                    </p>
                  </div>
                </div>

                {/* Status Update Actions */}
                <div className="p-6 bg-gray-50">
                  <h4 className="font-semibold text-[#4A3B32] mb-3">
                    Ubah Status Pesanan
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {statusTransitions[order.status].length > 0 ? (
                      statusTransitions[order.status].map((nextStatus) => (
                        <button
                          key={nextStatus}
                          onClick={() =>
                            handleStatusChange(order._id, nextStatus)
                          }
                          disabled={updatingOrderId === order._id}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                            nextStatus === "shipped"
                              ? "bg-blue-500 hover:bg-blue-600 text-white"
                              : nextStatus === "delivered"
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updatingOrderId === order._id && (
                            <Loader size={16} className="animate-spin" />
                          )}
                          {nextStatus === "shipped"
                            ? "📦 Kirim"
                            : nextStatus === "delivered"
                            ? "✓ Selesai"
                            : "❌ Batalkan"}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600">
                        Tidak ada aksi yang tersedia untuk status ini
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600 text-lg">
                {selectedStatus === "all"
                  ? "Tidak ada pesanan"
                  : `Tidak ada pesanan dengan status ${statusLabels[selectedStatus]}`}
              </p>
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}

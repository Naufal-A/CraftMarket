"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  PackageSearch,
  Calendar,
  LogOut,
} from "lucide-react";

interface DashboardStats {
  todaysOrders: number;
  orderChangePercent: number;
  pendingShipments: number;
  deliveredItems: number;
  todaysRevenue: number;
  revenueChangePercent: number;
  totalProducts: number;
}

interface RecentOrder {
  id: string;
  name: string;
  status: string;
  price: string | number;
  createdAt: string;
}

export default function SellerDashboard() {
  const [active, setActive] = useState("dashboard");
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    // Check if user is a seller
    const userStr = localStorage.getItem("user");
    console.log("[Dashboard] User string from localStorage:", userStr);
    
    if (!userStr) {
      console.warn("[Dashboard] No user data found");
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      console.log("[Dashboard] Parsed user:", user);
      console.log("[Dashboard] User role:", user.role);
      console.log("[Dashboard] User ID:", user._id);
      
      if (user.role === "seller") {
        setIsAuthorized(true);
        setUserId(user._id);
        console.log("[Dashboard] Seller ID in localStorage:", user._id);
        console.log("[Dashboard] Seller name:", user.name);
        console.log("[Dashboard] About to fetch dashboard data with sellerId:", user._id);
        fetchDashboardData(user._id).then(() => {
          console.log("[Dashboard] Data fetch completed, setting loading to false");
          setIsLoading(false);
        }).catch((err) => {
          console.error("[Dashboard] fetchDashboardData error:", err);
          setIsLoading(false);
        });
      } else {
        console.warn("[Dashboard] User is not a seller, redirecting to register");
        // Redirect buyers to seller registration
        router.push("/seller/register");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("[Dashboard] Error parsing user:", err);
      router.push("/login");
      setIsLoading(false);
    }
  }, [router]);

  const fetchDashboardData = async (sellerId: string) => {
    try {
      console.log("[Dashboard] fetchDashboardData - calling API for sellerId:", sellerId);
      const response = await fetch(`/api/seller/dashboard?sellerId=${sellerId}`);
      console.log("[Dashboard] API response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("[Dashboard] API response data:", data);
        console.log("[Dashboard] Stats:", data.stats);
        console.log("[Dashboard] Recent orders count:", data.recentOrders.length);
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      } else {
        console.error("[Dashboard] API error response:", response.status);
        const errorData = await response.json();
        console.error("[Dashboard] Error data:", errorData);
      }
    } catch (error) {
      console.error("[Dashboard] Error fetching dashboard data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/seller/login");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#F4EFEA] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8C735A] mx-auto mb-4"></div>
          <p className="text-[#4A3B32]">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if not authorized
  if (!isAuthorized) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex h-screen bg-[#F4EFEA]">
      
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
                if (item.key === "products") {
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

      <main className="flex-1 p-10 overflow-y-auto">
        <Header />
        {stats ? (
          <>
            <Stats stats={stats} />
            <RecentOrders orders={recentOrders} />
          </>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-800">Memuat data dashboard...</p>
          </div>
        )}
      </main>
    </div>
  );
}

function Header() {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-semibold text-[#4A3B32]">
          Seller Dashboard
        </h1>
        <p className="text-gray-800 text-sm mt-1">
          Welcome back! Here's your store overview
        </p>
        <p className="text-gray-600 text-xs mt-2" style={{color: "#999"}}>
          (Open DevTools to see sellerId in console logs)
        </p>
      </div>

      <button className="flex items-center gap-2 bg-[#C2AFA3] text-white px-4 py-2 rounded-lg shadow-sm">
        <Calendar size={18} />
        Today
      </button>
    </div>
  );
}

function Stats({ stats }: { stats: DashboardStats }) {
  console.log("[Stats Component] Rendering with stats:", stats);
  
  const items = [
    { 
      label: "Today's Orders", 
      value: stats.todaysOrders, 
      info: `${stats.orderChangePercent > 0 ? "+" : ""}${stats.orderChangePercent}% From Yesterday`, 
      color: stats.orderChangePercent >= 0 ? "text-green-600" : "text-red-600" 
    },
    { 
      label: "Pending Shipments", 
      value: stats.pendingShipments, 
      info: "Waiting to be shipped", 
      color: "text-yellow-600" 
    },
    { 
      label: "Delivered Items", 
      value: stats.deliveredItems, 
      info: "Total delivered", 
      color: "text-green-600" 
    },
    { 
      label: "Revenue Today", 
      value: `Rp ${(stats.todaysRevenue || 0).toLocaleString("id-ID")}`, 
      info: `${stats.revenueChangePercent > 0 ? "+" : ""}${stats.revenueChangePercent}% From Yesterday`, 
      color: stats.revenueChangePercent >= 0 ? "text-green-600" : "text-red-600" 
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 mb-10">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="text-sm text-gray-800 mb-2">{item.label}</div>
          <div className="text-3xl font-semibold text-[#4A3B32] mb-1">
            {item.value}
          </div>
          <div className={`text-xs ${item.color}`}>{item.info}</div>
        </div>
      ))}
    </div>
  );
}

function RecentOrders({ orders }: { orders: RecentOrder[] }) {
  console.log("[RecentOrders] Rendering with orders:", orders);
  console.log("[RecentOrders] Orders count:", orders.length);
  
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "bg-gray-200 text-gray-700",
      processing: "bg-yellow-200 text-yellow-700",
      shipped: "bg-blue-200 text-blue-700",
      delivered: "bg-green-200 text-green-700",
      cancelled: "bg-red-200 text-red-700",
    };
    return statusMap[status] || "bg-gray-200 text-gray-700";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatPrice = (price: string | number) => {
    if (typeof price === "number") {
      return `Rp ${price.toLocaleString("id-ID")}`;
    }
    return price.includes("Rp") ? price : `Rp ${price}`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold text-[#4A3B32]">Recent Orders</div>
        <button 
          onClick={() => {}}
          className="text-sm text-[#4A3B32] hover:underline"
        >
          View All
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {orders.length > 0 ? (
          orders.map((o, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200"
            >
              <div>
                <div className="font-medium text-[#4A3B32]">{o.id}</div>
                <div className="text-sm text-gray-800">{o.name}</div>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${getStatusColor(o.status)}`}
              >
                {o.status}
              </span>

              <div className="text-right">
                <div className="font-semibold text-[#4A3B32]">
                  {formatPrice(o.price)}
                </div>
                <div className="text-xs text-gray-700">
                  {formatTime(o.createdAt)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-800">
            No orders yet
          </div>
        )}
      </div>
    </div>
  );
}

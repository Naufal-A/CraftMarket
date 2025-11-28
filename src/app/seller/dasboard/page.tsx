"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  PackageSearch,
  Wallet,
  Settings,
  Calendar,
} from "lucide-react";

export default function SellerDashboard() {
  const [active, setActive] = useState("dashboard");
  const router = useRouter();

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
            { key: "wallet", label: "Wallet", icon: <Wallet size={18} /> },
            { key: "settings", label: "Settings", icon: <Settings size={18} /> },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActive(item.key);
                if (item.key === "products") {
                  router.push("/seller/products");
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
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <Header />
        <Stats />
        <RecentOrders />
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
        <p className="text-gray-600 text-sm mt-1">
          Welcome back! Here’s your store overview
        </p>
      </div>

      <button className="flex items-center gap-2 bg-[#C2AFA3] text-white px-4 py-2 rounded-lg shadow-sm">
        <Calendar size={18} />
        Today
      </button>
    </div>
  );
}

function Stats() {
  const items = [
    { label: "Today's Orders", value: "24", info: "+12% From Yesterday", color: "text-green-600" },
    { label: "Pending Shipments", value: "8", info: "-2 From Yesterday", color: "text-yellow-600" },
    { label: "Delivered Items", value: "156", info: "+28% From Yesterday", color: "text-green-600" },
    { label: "Revenue Today", value: "900.000", info: "-15% From Yesterday", color: "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 mb-10">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="text-sm text-gray-600 mb-2">{item.label}</div>
          <div className="text-3xl font-semibold text-[#4A3B32] mb-1">
            {item.value}
          </div>
          <div className={`text-xs ${item.color}`}>{item.info}</div>
        </div>
      ))}
    </div>
  );
}

function RecentOrders() {
  const orders = [
    { id: "#ORD-001", name: "Duta Setyawan", status: "Processing", price: "80.000", time: "2m ago", color: "bg-yellow-200 text-yellow-700" },
    { id: "#ORD-002", name: "Duta Setyawan", status: "Shipped", price: "110.000", time: "8m ago", color: "bg-blue-200 text-blue-700" },
    { id: "#ORD-003", name: "Duta Setyawan", status: "Delivered", price: "250.000", time: "18m ago", color: "bg-green-200 text-green-700" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold text-[#4A3B32]">Recent Orders</div>
        <button className="text-sm text-[#4A3B32] hover:underline">
          View All
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {orders.map((o, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200"
          >
            <div>
              <div className="font-medium text-[#4A3B32]">{o.id}</div>
              <div className="text-sm text-gray-600">{o.name}</div>
            </div>

            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${o.color}`}
            >
              {o.status}
            </span>

            <div className="text-right">
              <div className="font-semibold text-[#4A3B32]">{o.price}</div>
              <div className="text-xs text-gray-500">{o.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

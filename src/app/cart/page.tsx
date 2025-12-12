"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

interface CartItem {
  _id?: string;
  productId?: string;
  name: string;
  price: number;
  stock?: number;
  quantity: number;
  productName?: string;
}

function CartPageContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const pendingUpdatesRef = useRef<Set<string>>(new Set());

  // Load cart from database or localStorage
  useEffect(() => {
    const loadCart = async () => {
      try {
        // Get user ID from localStorage (set during login)
        const storedUserId = localStorage.getItem("userId");
        setUserId(storedUserId);

        if (storedUserId) {
          // Load from database
          const response = await fetch(`/api/cart?buyerId=${storedUserId}`);
          if (response.ok) {
            const cart = await response.json();
            // Map items to include _id field for consistency
            const mappedItems = (cart.items || []).map((item: Record<string, unknown>) => ({
              ...item,
              _id: (item._id as string) || (item.productId as string),
              name: (item.name as string) || (item.productName as string),
            }));
            setCartItems(mappedItems as CartItem[]);
            // Also update localStorage with mapped items
            localStorage.setItem("cart", JSON.stringify(mappedItems));
          }
        } else {
          // Fallback to localStorage
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            setCartItems(JSON.parse(savedCart));
          }
        }
      } catch (err) {
        console.error("Error loading cart:", err);
        // Fallback to localStorage
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    // Prevent double updates
    if (pendingUpdates.has(itemId)) {
      return;
    }

    if (newQuantity < 0) {
      return;
    }

    const item = cartItems.find((item) => item._id === itemId);
    
    if (!item) {
      console.error("Item not found in cart");
      return;
    }

    // Validate stock limit
    if (item.stock && newQuantity > item.stock) {
      // Cap at stock limit, don't reject
      newQuantity = item.stock;
    }

    // If quantity is 0 or negative, remove the item
    if (newQuantity === 0) {
      handleRemoveItem(itemId);
      return;
    }

    // Mark as pending to prevent double updates
    setPendingUpdates(prev => new Set(prev).add(itemId));
    pendingUpdatesRef.current.add(itemId);

    // Update local state immediately
    const updatedCart = cartItems.map((cartItem) =>
      cartItem._id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem
    );
    setCartItems(updatedCart);

    // Save to localStorage as backup
    try {
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        console.warn("Storage quota exceeded");
        localStorage.clear();
      }
    }

    // Save to database if user is logged in
    if (userId) {
      try {
        const response = await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyerId: userId,
            productId: item.productId,
            quantity: newQuantity,
          }),
        });

        if (!response.ok) {
          console.error("Failed to update cart in database:", response.statusText);
        }
      } catch (err) {
        console.error("Error updating cart in database:", err);
      } finally {
        // Remove from pending after database operation completes
        setPendingUpdates(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        pendingUpdatesRef.current.delete(itemId);
      }
    } else {
      // Remove from pending if no userId
      setPendingUpdates(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      pendingUpdatesRef.current.delete(itemId);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    // Find the item to get its productId
    const itemToDelete = cartItems.find((item) => (item._id || item.productId) === itemId);
    
    const updatedCart = cartItems.filter((item) => {
      const id = item._id || item.productId;
      return id !== itemId;
    });
    setCartItems(updatedCart);

    // Save to localStorage as backup
    try {
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        console.warn("Storage quota exceeded");
        localStorage.clear();
      }
    }

    // Remove from database if user is logged in
    if (userId && itemToDelete) {
      // Get the actual productId from database (not _id)
      const dbProductId = itemToDelete.productId || itemToDelete._id;
      console.log(`Deleting from DB: buyerId=${userId}, productId=${dbProductId}`);
      
      fetch(`/api/cart?buyerId=${userId}&productId=${dbProductId}`, {
        method: "DELETE",
      })
        .then((res) => {
          console.log(`Delete response status: ${res.status}`);
          if (!res.ok) {
            console.error("Failed to delete from database:", res.statusText);
            throw new Error(`Delete failed: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Item deleted from database:", data);
        })
        .catch((err) => {
          console.error("Error removing from cart in database:", err);
        });
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    
    // Wait for all pending updates using ref (real-time value)
    let waitAttempts = 0;
    const maxWaitAttempts = 100; // 10 seconds max wait (100 * 100ms)

    while (pendingUpdatesRef.current.size > 0 && waitAttempts < maxWaitAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waitAttempts++;
    }

    if (waitAttempts >= maxWaitAttempts) {
      console.warn("Timeout waiting for updates, proceeding anyway");
    }

    // Add extra delay to ensure database is truly synced
    await new Promise(resolve => setTimeout(resolve, 800));

    // Verify data is saved by refetching from database
    if (userId) {
      try {
        const response = await fetch(`/api/cart?buyerId=${userId}`);
        if (response.ok) {
          const cartData = await response.json();
          console.log("Cart verified before checkout:", cartData);
        }
      } catch (err) {
        console.error("Error verifying cart:", err);
      }
    }

    // Navigate to checkout
    window.location.href = "/checkout";
  };

  const handleClearAllCart = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus semua item dari keranjang?")) {
      return;
    }

    setCartItems([]);

    // Save to localStorage as backup
    try {
      localStorage.setItem("cart", JSON.stringify([]));
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        console.warn("Storage quota exceeded");
        localStorage.clear();
      }
    }

    // Clear all from database if user is logged in
    if (userId) {
      fetch(`/api/cart?buyerId=${userId}&clearAll=true`, {
        method: "DELETE",
      })
        .then((res) => {
          if (!res.ok) {
            console.error("Failed to clear cart from database:", res.statusText);
          }
        })
        .catch((err) => console.error("Error clearing cart from database:", err));
    }
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1; // 10% tax
  const shipping = cartItems.length > 0 ? 50000 : 0; // Fixed shipping cost
  const total = subtotal + tax + shipping;

  if (loading) {
    return (
      <>
        <Header cartCount={cartItems.length} />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-600 text-lg">Loading...</p>
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
        <section className="bg-gradient-to-r from-[#8C735A] to-[#A68E74] text-white py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold">Keranjang Belanja</h1>
            <p className="text-opacity-90">Periksa dan selesaikan pembelian Anda</p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Keranjang Anda Kosong
              </h2>
              <p className="text-gray-600 mb-6">
                Mulai belanja dan temukan produk favorit Anda
              </p>
              <Link
                href="/products"
                className="inline-block bg-[#8C735A] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#7A6248] transition"
              >
                Lanjut Belanja
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">
                      Produk ({cartItems.length})
                    </h2>
                    <button
                      onClick={handleClearAllCart}
                      className="text-sm text-red-600 hover:text-red-700 hover:underline transition font-medium"
                    >
                      Hapus Semua
                    </button>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => {
                      const itemId = item._id || item.productId || "";
                      return (
                      <div
                        key={itemId}
                        className="p-6 flex gap-6 hover:bg-gray-50 transition"
                      >
                        {/* Product Image Placeholder */}
                        <div className="w-24 h-24 bg-gradient-to-br from-[#E8DCC8] to-[#D4C4B0] rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-3xl">📦</span>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">
                            {item.name || item.productName}
                          </h3>
                          <p className="text-sm text-gray-800 mb-3">
                            Rp{item.price.toLocaleString("id-ID")} per item
                          </p>

                          {/* Quantity Control */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(itemId, Math.max(0, item.quantity - 1))
                              }
                              disabled={pendingUpdates.has(itemId)}
                              className="p-1 hover:bg-gray-200 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus size={18} className="text-gray-800" />
                            </button>
                            <span className="w-12 text-center py-1 text-gray-900 font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(itemId, item.quantity + 1)
                              }
                              disabled={item.quantity > (item.stock || 999) || pendingUpdates.has(itemId)}
                              className="p-1 hover:bg-gray-200 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus size={18} className="text-gray-800" />
                            </button>
                          </div>
                        </div>

                        {/* Price & Delete */}
                        <div className="text-right flex flex-col items-end justify-between">
                          <p className="text-xl font-bold text-[#8C735A]">
                            Rp
                            {(item.price * item.quantity).toLocaleString("id-ID")}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(itemId)}
                            disabled={pendingUpdates.has(itemId)}
                            className="text-red-600 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    Ringkasan Pesanan
                  </h2>

                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span>Rp{subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Pajak (10%):</span>
                      <span>Rp{tax.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Pengiriman:</span>
                      <span>Rp{shipping.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <div className="flex justify-between mb-6">
                    <span className="text-lg font-bold text-gray-800">Total:</span>
                    <span className="text-2xl font-bold text-[#8C735A]">
                      Rp{total.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading || cartItems.length === 0}
                    className="block w-full bg-[#8C735A] text-white py-3 rounded-lg font-bold hover:bg-[#7A6248] transition mb-3 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading ? "Memproses..." : "Lanjut ke Pembayaran"}
                  </button>

                  <Link
                    href="/products"
                    className="block text-center bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
                  >
                    Lanjut Belanja
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute requiredRole="buyer">
      <CartPageContent />
    </ProtectedRoute>
  );
}

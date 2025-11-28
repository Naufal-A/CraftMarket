"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  stock: number;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error("Error parsing cart:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    const product = cartItems.find((item) => item._id === productId);
    if (product && newQuantity > product.stock) {
      return;
    }

    const updatedCart = cartItems.map((item) =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleRemoveItem = (productId: string) => {
    const updatedCart = cartItems.filter((item) => item._id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
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
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">
                      Produk ({cartItems.length})
                    </h2>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <div
                        key={item._id}
                        className="p-6 flex gap-6 hover:bg-gray-50 transition"
                      >
                        {/* Product Image Placeholder */}
                        <div className="w-24 h-24 bg-gradient-to-br from-[#E8DCC8] to-[#D4C4B0] rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-3xl">📦</span>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Rp{item.price.toLocaleString("id-ID")} per item
                          </p>

                          {/* Quantity Control */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item._id, item.quantity - 1)
                              }
                              className="p-1 hover:bg-gray-200 rounded transition"
                            >
                              <Minus size={18} className="text-gray-600" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(item._id, parseInt(e.target.value))
                              }
                              min="1"
                              max={item.stock}
                              className="w-12 text-center border border-gray-300 rounded py-1"
                            />
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item._id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.stock}
                              className="p-1 hover:bg-gray-200 rounded transition disabled:opacity-50"
                            >
                              <Plus size={18} className="text-gray-600" />
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
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-red-600 hover:text-red-700 transition"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
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

                  <button className="w-full bg-[#8C735A] text-white py-3 rounded-lg font-bold hover:bg-[#7A6248] transition mb-3">
                    Lanjut ke Pembayaran
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

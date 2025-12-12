"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  images: string[];
}

interface CartItem extends Product {
  quantity: number;
}

const ProductsPageContent = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        const productsList = Array.isArray(data) ? data : data.products || [];
        setProducts(productsList);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Load cart from database or localStorage (only on mount)
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedUserId = localStorage.getItem("userId");
        setUserId(storedUserId);

        if (storedUserId) {
          // Load from database
          const response = await fetch(`/api/cart?buyerId=${storedUserId}`);
          if (response.ok) {
            const cartData = await response.json();
            setCart(cartData.items || []);
          }
        } else {
          // Fallback to localStorage
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            setCart(JSON.parse(savedCart));
          }
        }
      } catch (err) {
        console.error("Error loading cart:", err);
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      }
    };
    loadCart();
  }, []);

  // Save cart to localStorage with error handling
  useEffect(() => {
    try {
      if (cart.length > 0 || typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        console.warn("Storage quota exceeded. Clearing old data...");
        localStorage.clear();
      } else {
        console.error("Error saving cart:", error);
      }
    }
  }, [cart]);

  const handleAddToCart = async (product: Product) => {
    if (product.stock === 0 || isAddingToCart) return;

    setIsAddingToCart(true);

    try {
      // Get fresh cart data from database/localStorage to avoid stale state
      let freshCart: CartItem[] = [];
      
      if (userId) {
        const response = await fetch(`/api/cart?buyerId=${userId}`);
        if (response.ok) {
          const cartData = await response.json();
          freshCart = cartData.items || [];
        }
      } else {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          freshCart = JSON.parse(savedCart);
        }
      }

      // Find existing item in fresh cart
      const existingItem = freshCart.find((item) => item._id === product._id || item.productId === product._id);
      let newQuantity = 1;

      if (existingItem) {
        // Check if already at max stock
        if (existingItem.quantity >= product.stock) {
          // Already at max stock, don't add
          setShowCartNotification(false);
          setIsAddingToCart(false);
          return;
        }
        newQuantity = existingItem.quantity + 1;
        // Also cap at stock limit
        if (newQuantity > product.stock) {
          newQuantity = product.stock;
        }
      }

      // Update cart with fresh data
      let updatedCart: CartItem[];
      if (existingItem) {
        updatedCart = freshCart.map((item) =>
          (item._id === product._id || item.productId === product._id)
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        updatedCart = [...freshCart, { ...product, quantity: 1 }];
      }

      // Apply update to state
      setCart(updatedCart);

      // Save to localStorage
      try {
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }

      // Save to database if user is logged in
      if (userId) {
        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyerId: userId,
            productId: product._id,
            productName: product.name,
            price: product.price,
            quantity: newQuantity,
            image: product.images?.[0],
          }),
        }).catch((err) => {
          console.error("Error saving to database:", err);
        });
      }

      setShowCartNotification(true);
      setTimeout(() => setShowCartNotification(false), 2000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const categories = ["All", "Furniture", "Crafts", "Accessories"];
  const cartTotal = cart.length;

  return (
    <>
      <Header cartCount={cartTotal} />
      <main className="w-full bg-white">
        {/* Cart Notification */}
        {showCartNotification && (
          <div className="fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
            ✓ Produk ditambahkan ke keranjang
          </div>
        )}

        {/* === HEADER SECTION === */}
        <section className="w-full bg-gradient-to-r from-[#8C735A] to-[#A68E74] text-white py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Jelajahi Produk Kami
            </h1>
            <p className="text-lg opacity-90">
              Temukan koleksi kerajinan terbaik dari pengrajin lokal
            </p>
          </div>
        </section>

        {/* === CATEGORY FILTER === */}
        <section className="w-full bg-gray-50 py-8 px-6 border-b border-gray-200">
          <div className="max-w-6xl mx-auto flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  selectedCategory === cat
                    ? "bg-[#8C735A] text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-[#8C735A]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* === PRODUCTS GRID === */}
        <section className="w-full py-12 px-6">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-800 text-lg">Loading produk...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  Belum ada produk di kategori ini
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    key={product._id}
                    href={`/products/${product._id}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group border border-gray-200 block"
                  >
                    <div
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group border border-gray-200"
                    >
                      {/* Product Image */}
                      <div className="w-full h-48 bg-gradient-to-br from-[#E8DCC8] to-[#D4C4B0] flex items-center justify-center group-hover:from-[#D4C4B0] group-hover:to-[#C4B4A0] transition overflow-hidden">
                        {product.images && product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={200}
                            height={192}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        ) : (
                          <div className="text-5xl">📦</div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        {/* Category Badge */}
                        <span className="inline-block text-xs font-semibold text-[#8C735A] bg-[#F0E6D8] px-3 py-1 rounded-full mb-2">
                          {product.category}
                        </span>

                        {/* Product Name */}
                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                          {product.name}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-800 mb-3 line-clamp-2">
                          {product.description}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-medium text-gray-700">
                          {product.rating} ({product.reviews} reviews)
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-[#8C735A]">
                          Rp{product.price.toLocaleString("id-ID")}
                        </p>
                      </div>

                      {/* Stock Status */}
                      <div className="mb-4">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            product.stock > 0
                              ? product.stock < 5
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.stock > 0
                            ? product.stock < 5
                              ? `Tinggal ${product.stock}`
                              : "Tersedia"
                            : "Habis"}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                          disabled={product.stock === 0 || isAddingToCart}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${
                            product.stock === 0 || isAddingToCart
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-[#8C735A] text-white hover:bg-[#7A6248]"
                          }`}
                        >
                          <ShoppingCart size={18} />
                          {isAddingToCart ? "..." : "Tambah"}
                        </button>
                        <button
                          onClick={(e) => e.preventDefault()}
                          className="flex items-center justify-center px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-[#8C735A] transition"
                        >
                          <Heart size={18} className="text-gray-400 hover:text-[#8C735A]" />
                        </button>
                      </div>
                    </div>
                  </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default function ProductsPage() {
  return (
    <ProtectedRoute requiredRole="buyer">
      <ProductsPageContent />
    </ProtectedRoute>
  );
}

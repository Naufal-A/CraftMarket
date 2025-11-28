"use client";

import { ShoppingCart, Heart, ArrowLeft } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

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
  sellerId: string;
  createdAt: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data.product || data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find((item) => item._id === product._id);

    let updatedCart;
    if (existingItem) {
      updatedCart = cart.map((item) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity }];
    }

    setCart(updatedCart);
    try {
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        console.warn("Storage quota exceeded. Clearing old data...");
        localStorage.clear();
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }
    }
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EFEA]">
        <Header cartCount={cart.length} />
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-gray-600">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F4EFEA]">
        <Header cartCount={cart.length} />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Link
            href="/products"
            className="flex items-center gap-2 text-[#8C735A] hover:text-[#6B5945] mb-6"
          >
            <ArrowLeft size={20} />
            Kembali ke Produk
          </Link>
          <p className="text-center text-gray-600 text-lg">Produk tidak ditemukan</p>
        </div>
        <Footer />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#F4EFEA]">
      <Header cartCount={cart.length} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/products"
          className="flex items-center gap-2 text-[#8C735A] hover:text-[#6B5945] mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Kembali ke Produk
        </Link>

        {/* Product Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div>
              <div className="bg-gradient-to-br from-[#E8DCC8] to-[#D4C4B0] rounded-xl overflow-hidden mb-4">
                {product.images && product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="w-full h-[500px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[500px] flex items-center justify-center text-6xl">
                    📦
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-[#8C735A] transition"
                    >
                      <Image
                        src={img}
                        alt={`Product ${idx + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              {/* Category Badge */}
              <span className="inline-block text-xs font-semibold text-[#8C735A] bg-[#F0E6D8] px-4 py-2 rounded-full mb-4">
                {product.category}
              </span>

              {/* Product Name */}
              <h1 className="text-4xl font-bold text-[#4A3B32] mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span className="font-semibold text-gray-800">{product.rating}</span>
                </div>
                <span className="text-gray-600">
                  ({product.reviews} ulasan)
                </span>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#4A3B32] mb-2">
                  Deskripsi
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Harga</p>
                <p className="text-4xl font-bold text-[#8C735A]">
                  Rp{product.price.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Stock Status */}
              <div className="mb-8">
                <p className="text-sm text-gray-600 mb-2">Ketersediaan</p>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-2 rounded-lg font-semibold ${
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
                  <span className="text-gray-600">
                    ({product.stock} item tersedia)
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <p className="text-sm text-gray-600 mb-3">Jumlah</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="text-lg font-semibold w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-white transition ${
                    product.stock === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#8C735A] hover:bg-[#7A6248]"
                  }`}
                >
                  <ShoppingCart size={20} />
                  Tambah ke Keranjang
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-6 border-2 border-[#8C735A] text-[#8C735A] rounded-lg font-semibold hover:bg-[#F4EFEA] transition">
                  <Heart size={20} />
                </button>
              </div>

              {/* Notification */}
              {showNotification && (
                <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  ✓ Produk berhasil ditambahkan ke keranjang
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-[#4A3B32] mb-8">Ratings and Reviews</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-[#4A3B32] mb-2">
                  {product.rating.toFixed(1)}
                </div>
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-2xl">
                      {i < Math.floor(product.rating) ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600">({product.reviews} Reviews)</p>
              </div>

              {/* Rating Breakdown */}
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = Math.floor(Math.random() * 20); // Dummy count for now
                  const percentage = count > 0 ? (count / 60) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-6">★ {rating}</span>
                      <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>

              <button className="w-full mt-8 bg-[#8C735A] text-white py-3 rounded-lg font-semibold hover:bg-[#7A6248] transition">
                Write a review
              </button>
            </div>

            {/* Reviews List */}
            <div className="md:col-span-2 space-y-6">
              {/* Sample Reviews */}
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#8C735A] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      U
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">User detail</p>
                        <p className="text-sm text-gray-500">Nov {15 + idx}, 2024</p>
                      </div>
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-lg">⭐</span>
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                See More
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

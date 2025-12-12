"use client";

import { ShoppingCart, Heart, ArrowLeft } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProtectedRoute from "@/components/ProtectedRoute";
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

interface Review {
  _id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  orderId: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Order {
  _id: string;
  orderId: string;
  buyerId: string;
  items: { productId: string }[];
  createdAt: string;
}

function ProductDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
  const [productId, setProductId] = useState<string>("");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  });
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  // Extract params
  useEffect(() => {
    params.then((p) => setProductId(p.id));
  }, [params]);

  // Fetch product details
  useEffect(() => {
    if (!productId) return;
    
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data.product || data);

        // Fetch reviews for this product
        const reviewRes = await fetch(`/api/reviews?productId=${productId}`);
        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          setReviews(reviewData.reviews || []);
          setAverageRating(parseFloat(reviewData.averageRating) || 0);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // Load cart from database or localStorage
  useEffect(() => {
    const loadCart = async () => {
      try {
        let currentUserId = localStorage.getItem("userId");
        console.log("[Product Page] Initial userId from localStorage:", currentUserId);
        
        // Fallback: try to get userId from user object
        if (!currentUserId) {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              currentUserId = user._id;
              console.log("[Product Page] Got userId from user object:", currentUserId);
            } catch (e) {
              console.error("[Product Page] Error parsing user object:", e);
            }
          }
        }
        
        setUserId(currentUserId);
        console.log("[Product Page] Final userId:", currentUserId);

        if (currentUserId) {
          // Always load from database for logged-in users (fresh data)
          console.log("[Product Page] Fetching cart from DB for userId:", currentUserId);
          const response = await fetch(`/api/cart?buyerId=${currentUserId}`);
          if (response.ok) {
            const cartData = await response.json();
            console.log("[Product Page] Cart data from DB:", cartData.items?.length || 0, "items");
            // Map items to include _id field for consistency
            const mappedItems = (cartData.items || []).map((item: Record<string, unknown>) => ({
              ...item,
              _id: (item._id as string) || (item.productId as string),
              name: (item.name as string) || (item.productName as string),
            }));
            setCart(mappedItems as CartItem[]);
            // Also update localStorage with fresh data from database
            localStorage.setItem("cart", JSON.stringify(mappedItems));
          }
        } else {
          console.log("[Product Page] No userId, using localStorage cart");
          // For non-logged-in users, use localStorage
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
    
    // Listen for custom cart update events
    const handleCartUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        setCart(customEvent.detail);
      }
    };
    
    // Listen for storage changes (when cart is updated in another tab/page)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart" && e.newValue) {
        setCart(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Fetch delivered orders for review eligibility
  useEffect(() => {
    if (!userId || !productId) return;

    const fetchDeliveredOrders = async () => {
      try {
        const response = await fetch(
          `/api/orders?buyerId=${userId}&status=delivered`
        );
        if (response.ok) {
          const data = await response.json();
          const relevantOrders = data.orders.filter((order: Order) =>
            order.items.some((item: { productId: string }) => item.productId === productId)
          );
          setDeliveredOrders(relevantOrders);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchDeliveredOrders();
  }, [userId, productId]);

  const handleAddToCart = async (product: Product) => {
    console.log("[handleAddToCart] Adding product:", product.name);
    console.log("[handleAddToCart] Current userId:", userId);
    console.log("[handleAddToCart] Product sellerId:", product.sellerId);
    
    const existingItem = cart.find((item) => item._id === product._id);

    let updatedCart;
    if (existingItem) {
      // If item exists, just increment by 1 (ignore quantity selector)
      updatedCart = cart.map((item) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      // If new item, add with quantity 1 (ignore quantity selector)
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(updatedCart);
    try {
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      console.log("[handleAddToCart] Cart saved to localStorage");
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        console.warn("Storage quota exceeded. Clearing old data...");
        localStorage.clear();
      }
    }

    // Dispatch custom event to sync other components
    window.dispatchEvent(
      new CustomEvent("cartUpdated", { detail: updatedCart })
    );

    // Save to database if user is logged in
    if (userId) {
      try {
        console.log("[handleAddToCart] Saving to DB with userId:", userId);
        const cartResponse = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyerId: userId,
            productId: product._id,
            productName: product.name,
            price: product.price,
            quantity: existingItem ? existingItem.quantity + 1 : 1,
            image: product.images?.[0],
            sellerId: product.sellerId,
          }),
        });
        console.log("[handleAddToCart] DB save response:", cartResponse.status);
        if (cartResponse.ok) {
          console.log("[handleAddToCart] Successfully saved to DB");
        }
      } catch (err) {
        console.error("Error saving to database:", err);
      }
    } else {
      console.warn("[handleAddToCart] No userId - not saving to DB");
    }

    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const handleSubmitReview = async (orderId: string) => {
    if (!userId || !product) return;

    if (reviewData.comment.length < 10) {
      setReviewMessage("Komentar minimal 10 karakter");
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          buyerId: userId,
          buyerName: localStorage.getItem("userName") || "Pembeli",
          orderId,
          rating: reviewData.rating,
          comment: reviewData.comment,
        }),
      });

      if (response.ok) {
        setReviewMessage("✓ Review berhasil dikirim");
        setReviewData({ rating: 5, comment: "" });
        setShowReviewForm(false);

        // Refresh reviews
        const reviewRes = await fetch(`/api/reviews?productId=${product._id}`);
        if (reviewRes.ok) {
          const data = await reviewRes.json();
          setReviews(data.reviews || []);
          setAverageRating(parseFloat(data.averageRating) || 0);
        } else {
          console.error("Failed to fetch reviews:", reviewRes.statusText);
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setReviewMessage(""), 3000);
      } else {
        const error = await response.json();
        setReviewMessage(error.error || "Gagal mengirim review");
      }
    } catch (err) {
      setReviewMessage("Terjadi kesalahan");
      console.error("Error submitting review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EFEA]">
        <Header cartCount={cart.length} />
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-gray-800">Loading...</p>
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
          <p className="text-center text-gray-800 text-lg">Produk tidak ditemukan</p>
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
                <span className="text-gray-800">
                  ({product.reviews} ulasan)
                </span>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#4A3B32] mb-2">
                  Deskripsi
                </h3>
                <p className="text-gray-900 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <p className="text-sm text-gray-800 mb-2">Harga</p>
                <p className="text-4xl font-bold text-[#8C735A]">
                  Rp{product.price.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Stock Status */}
              <div className="mb-8">
                <p className="text-sm text-gray-800 mb-2">Ketersediaan</p>
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
                  <span className="text-gray-800">
                    ({product.stock} item tersedia)
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <p className="text-sm text-gray-800 mb-3">Jumlah</p>
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
          <h2 className="text-3xl font-bold text-[#4A3B32] mb-8">Ulasan dan Penilaian</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-[#4A3B32] mb-2">
                  {averageRating > 0 ? averageRating.toFixed(1) : "0"}
                </div>
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-2xl">
                      {i < Math.floor(averageRating) ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
                <p className="text-gray-800">({reviews.length} Ulasan)</p>
              </div>

              {deliveredOrders.length > 0 && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="w-full bg-[#8C735A] text-white py-3 rounded-lg font-semibold hover:bg-[#7A6248] transition"
                >
                  {showReviewForm ? "Batal" : "Tulis Ulasan"}
                </button>
              )}

              {deliveredOrders.length === 0 && (
                <p className="text-center text-sm text-gray-600 py-3">
                  Pesan produk ini terlebih dahulu untuk menulis ulasan
                </p>
              )}
            </div>

            {/* Review Form & Reviews List */}
            <div className="md:col-span-2">
              {/* Success/Error Message */}
              {reviewMessage && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    reviewMessage.includes("✓")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {reviewMessage}
                </div>
              )}

              {showReviewForm && deliveredOrders.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
                  <h3 className="text-lg font-semibold text-[#4A3B32] mb-4">
                    Tulis Ulasan Anda
                  </h3>

                  {/* Select Order */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#4A3B32] mb-2">
                      Pesanan yang ingin diulas
                    </label>
                    <select
                      id="orderSelect"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8C735A]"
                    >
                      {deliveredOrders.map((order) => (
                        <option key={order._id} value={order._id}>
                          {order.orderId} - {new Date(order.createdAt).toLocaleDateString('id-ID')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#4A3B32] mb-2">
                      Penilaian
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() =>
                            setReviewData({ ...reviewData, rating: star })
                          }
                          className="text-3xl transition"
                        >
                          {star <= reviewData.rating ? "⭐" : "☆"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#4A3B32] mb-2">
                      Komentar (min. 10 karakter)
                    </label>
                    <textarea
                      value={reviewData.comment}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          comment: e.target.value,
                        })
                      }
                      placeholder="Bagikan pengalaman Anda dengan produk ini..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8C735A] resize-none"
                      rows={4}
                    ></textarea>
                    <p className="text-xs text-gray-600 mt-1">
                      {reviewData.comment.length}/500 karakter
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={() => {
                      const orderSelect = document.getElementById(
                        "orderSelect"
                      ) as HTMLSelectElement;
                      handleSubmitReview(orderSelect.value);
                    }}
                    disabled={submittingReview || reviewData.comment.length < 10}
                    className="w-full bg-[#8C735A] text-white py-3 rounded-lg font-semibold hover:bg-[#7A6248] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReview ? "Mengirim..." : "Kirim Ulasan"}
                  </button>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div
                      key={review._id}
                      className="bg-white rounded-xl p-6 shadow-lg"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#8C735A] rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {review.buyerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-gray-900">
                              {review.buyerName}
                            </p>
                            <p className="text-sm text-gray-700">
                              {new Date(review.createdAt).toLocaleDateString(
                                "id-ID"
                              )}
                            </p>
                          </div>
                          <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className="text-lg">
                                {i < review.rating ? "⭐" : "☆"}
                              </span>
                            ))}
                          </div>
                          <p className="text-gray-900 text-sm leading-relaxed">
                            {review.comment}
                          </p>
                          {review.verified && (
                            <p className="text-xs text-green-600 mt-2">
                              ✓ Pembeli Terverifikasi
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl p-6 shadow-lg text-center text-gray-600">
                    Belum ada ulasan. Jadilah yang pertama untuk menulisnya!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute requiredRole="buyer">
      <ProductDetailPageContent {...props} />
    </ProtectedRoute>
  );
}

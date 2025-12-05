"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";
import { CheckCircle, AlertCircle, Clock, Home } from "lucide-react";

interface PaymentStatus {
  payment: {
    transactionId: string;
    status: "pending" | "completed" | "settlement" | "failed" | "expired";
    amount: number;
    paymentMethod: string;
    createdAt: string;
  };
  order: {
    orderId: string;
    status: string;
    totalPrice: number;
    items: Array<Record<string, unknown>>;
    shippingAddress: Record<string, unknown>;
    createdAt: string;
  };
}

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("Order ID tidak ditemukan");
      setLoading(false);
      return;
    }

    const fetchPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment/status?orderId=${orderId}`);

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || "Gagal mengambil status pembayaran");
          return;
        }

        const data = await response.json();
        setStatus(data);
        setError(""); // Clear error if success
      } catch (err) {
        console.error("Error fetching payment status:", err);
        setError("Terjadi kesalahan saat mengambil status pembayaran");
      } finally {
        setLoading(false);
      }
    };

    // Fetch initial status
    fetchPaymentStatus();

    // Poll for status updates every 3 seconds for 2 minutes
    const interval = setInterval(fetchPaymentStatus, 3000);
    const timeout = setTimeout(() => clearInterval(interval), 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [orderId]);

  if (loading) {
    return (
      <>
        <Header cartCount={0} />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8C735A] mx-auto mb-4"></div>
            <p className="text-gray-800 text-lg">Memproses pembayaran Anda...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error && !status) {
    return (
      <>
        <Header cartCount={0} />
        <main className="min-h-screen bg-gray-50">
          <section className="bg-gradient-to-r from-[#8C735A] to-[#A68E74] text-white py-8 px-6">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold">Status Pembayaran</h1>
            </div>
          </section>

          <div className="max-w-2xl mx-auto px-6 py-12">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <AlertCircle size={64} className="text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Gagal Memuat Status
              </h2>
              <p className="text-gray-800 mb-4">{error}</p>
              {orderId && (
                <p className="text-gray-600 mb-8">
                  <strong>ID Pesanan:</strong> {orderId}
                </p>
              )}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-block bg-[#8C735A] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#7A6248] transition"
                >
                  Coba Lagi
                </button>
                <Link
                  href="/products"
                  className="inline-block bg-gray-400 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-500 transition"
                >
                  Kembali ke Produk
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const payment = status?.payment;
  const order = status?.order;

  const getStatusDisplay = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "completed":
      case "settlement":
        return {
          icon: <CheckCircle size={64} className="text-green-500" />,
          title: "Pembayaran Berhasil",
          description: "Pesanan Anda telah diterima dan sedang diproses",
          color: "green",
        };
      case "pending":
        return {
          icon: <Clock size={64} className="text-yellow-500" />,
          title: "Pembayaran Menunggu",
          description: "Pesanan Anda masih menunggu konfirmasi pembayaran",
          color: "yellow",
        };
      case "failed":
        return {
          icon: <AlertCircle size={64} className="text-red-500" />,
          title: "Pembayaran Gagal",
          description: "Pembayaran Anda ditolak. Silakan coba lagi.",
          color: "red",
        };
      case "expired":
        return {
          icon: <AlertCircle size={64} className="text-red-500" />,
          title: "Pembayaran Kadaluarsa",
          description: "Waktu pembayaran telah berakhir. Silakan buat pesanan baru.",
          color: "red",
        };
      default:
        return {
          icon: <Clock size={64} className="text-gray-700" />,
          title: "Status Tidak Diketahui",
          description: "Silakan coba lagi nanti",
          color: "gray",
        };
    }
  };

  const statusDisplay = payment ? getStatusDisplay(payment.status) : null;

  return (
    <>
      <Header cartCount={0} />
      <main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-[#8C735A] to-[#A68E74] text-white py-6 px-6 border-none">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold">Status Pembayaran</h1>
          </div>
        </section>

        {status && payment && order && (
          <div className="max-w-4xl mx-auto px-6 py-12">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm p-12 text-center mb-8">
              <div className="flex justify-center mb-6">{statusDisplay?.icon}</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {statusDisplay?.title}
              </h2>
              <p className="text-gray-800 mb-8">{statusDisplay?.description}</p>
              <div className="inline-block bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-900 font-mono">
                ID Pesanan: {order.orderId}
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Informasi Pembayaran
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-800">ID Transaksi:</span>
                    <span className="font-mono text-gray-800">
                      {payment.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-800">Metode Pembayaran:</span>
                    <span className="font-semibold text-gray-800 capitalize">
                      {payment.paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-800">Jumlah:</span>
                    <span className="font-semibold text-gray-800">
                      Rp{payment.amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800">Status:</span>
                    <span
                      className={`font-semibold capitalize px-3 py-1 rounded-full text-xs ${
                        payment.status === "completed" || payment.status === "settlement"
                          ? "bg-green-100 text-green-800"
                          : payment.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {payment.status === "completed" || payment.status === "settlement"
                        ? "Berhasil"
                        : payment.status === "pending"
                        ? "Menunggu"
                        : payment.status === "failed"
                        ? "Gagal"
                        : "Kadaluarsa"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Informasi Pesanan
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-800">Total Pesanan:</span>
                    <span className="font-semibold text-gray-800">
                      Rp{order.totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-800">Jumlah Item:</span>
                    <span className="font-semibold text-gray-800">
                      {order.items.length} produk
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-800">Status Pesanan:</span>
                    <span
                      className={`font-semibold capitalize px-3 py-1 rounded-full text-xs ${
                        order.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "shipped"
                          ? "bg-purple-100 text-purple-800"
                          : order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status === "processing"
                        ? "Diproses"
                        : order.status === "pending"
                        ? "Menunggu"
                        : order.status === "shipped"
                        ? "Dikirim"
                        : order.status === "delivered"
                        ? "Terkirim"
                        : "Dibatalkan"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-800 block mb-2">Tanggal Pesanan:</span>
                    <span className="text-gray-800">
                      {new Date(order.createdAt).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Detail Pesanan
              </h3>
              <div className="space-y-3">
                {order.items.map((item, idx) => {
                  const price = (item.price as unknown as number) || 0;
                  const quantity = (item.quantity as unknown as number) || 0;
                  return (
                    <div
                      key={idx}
                      className="flex justify-between pb-3 border-b border-gray-200 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {(item.productName as string) || (item.name as string)}
                        </p>
                        <p className="text-sm text-gray-800">
                          Qty: {quantity} x Rp{price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-800">
                        Rp{(price * quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Alamat Pengiriman
              </h3>
              <div className="text-gray-900 space-y-1">
                <p className="font-medium">
                  {(order.shippingAddress.fullName as string)}
                </p>
                <p className="text-sm">
                  {(order.shippingAddress.address as string)}
                </p>
                <p className="text-sm">
                  {(order.shippingAddress.city as string)},{" "}
                  {(order.shippingAddress.province as string)}{" "}
                  {(order.shippingAddress.postalCode as string)}
                </p>
                <p className="text-sm">Telepon: {order.shippingAddress.phone as string}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link
                href="/home"
                className="flex-1 flex items-center justify-center gap-2 bg-[#8C735A] text-white py-3 rounded-lg font-bold hover:bg-[#7A6248] transition"
              >
                <Home size={20} />
                Kembali ke Beranda
              </Link>
              <Link
                href="/products"
                className="flex-1 border-2 border-[#8C735A] text-[#8C735A] py-3 rounded-lg font-bold hover:bg-orange-50 transition text-center"
              >
                Lanjut Belanja
              </Link>
            </div>

            {/* Additional Info */}
            {payment.status !== "completed" && (
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-bold text-blue-900 mb-2">Informasi Penting</h4>
                <p className="text-sm text-blue-800">
                  {payment.status === "pending"
                    ? "Pembayaran Anda masih diproses. Kami akan mengirimkan notifikasi email saat status pembayaran berubah. Jika Anda tidak menerima notifikasi dalam 5 menit, silakan hubungi customer service kami."
                    : payment.status === "failed"
                    ? "Pembayaran Anda gagal diproses. Silakan kembali ke keranjang dan coba dengan metode pembayaran lain."
                    : "Waktu pembayaran Anda telah berakhir. Silakan buat pesanan baru untuk melanjutkan pembelian."}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

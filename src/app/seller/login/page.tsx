"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function SellerLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login gagal!");
        return;
      }

      // Check if user is seller
      if (data.user.role !== "seller") {
        setError("Akun ini bukan akun seller. Silakan gunakan seller register.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/seller/dasboard");

    } catch (err: unknown) {
      setError("Terjadi kesalahan server.");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">

      <div className="w-1/2 bg-white flex flex-col justify-center px-24">

        <Image 
          src="/images/logo.png" 
          alt="CraftMarket Logo" 
          width={80}
          height={80}
          className="mb-8 opacity-90 mx-auto" 
        />

        <h1 className="text-4xl font-semibold text-[#8C6E63] mb-6 text-center">
          Masuk ke Seller Centre
        </h1>

        <div className="flex gap-6 mb-6 justify-center">
          {["/images/facebook.png", "/images/google.png", "/images/linkendin.png"].map((src, i) => (
            <div key={i} className="w-14 h-14 rounded-full shadow flex items-center justify-center cursor-pointer bg-white">
              <Image src={src} alt="Social media icon" width={28} height={28} />
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-800 mb-6 text-center">
          atau gunakan akun email Anda
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-400 focus:border-[#B89C8A] focus:ring-1 focus:ring-[#B89C8A] rounded-md px-4 py-3 w-full mb-4 placeholder-gray-800 text-gray-900 bg-white"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-400 focus:border-[#B89C8A] focus:ring-1 focus:ring-[#B89C8A] rounded-md px-4 py-3 w-full mb-4 placeholder-gray-800 text-gray-900 bg-white"
          />

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#B89C8A] text-white w-full py-3 rounded-md hover:bg-[#A88B78] transition text-lg disabled:opacity-50"
          >
            {loading ? "Sedang masuk..." : "MASUK"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-300 text-center">
          <p className="text-gray-800 text-sm mb-3">
            Belum punya akun seller?
          </p>
          <Link
            href="/seller/register"
            className="inline-block bg-[#B89C8A] text-white px-6 py-2 rounded-md font-medium hover:bg-[#A88B78] transition"
          >
            Silahkan Registrasi
          </Link>
        </div>
      </div>

      <div className="w-1/2 bg-[#CAB1A3] flex flex-col items-center justify-center px-20 text-white">
        <h2 className="text-4xl font-bold mb-4">Jadilah Penjual Terbaik</h2>
        <p className="text-center text-lg opacity-90">
          Kelola tokomu dengan mudah melalui CraftMarket Seller Centre.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="mt-6 px-6 py-2 border border-white rounded-lg hover:bg-white hover:text-[#CAB1A3] transition font-medium"
        >
          Ingin berbelanja sebagai pembeli?
        </button>
      </div>

    </div>
  );
}

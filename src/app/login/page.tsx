"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login gagal");
        return;
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user?._id) {
        localStorage.setItem("userId", data.user._id);
      }

      // Redirect to home
      router.push("/home");
    } catch (err) {
      setError("Terjadi kesalahan saat login");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      
      <div className="w-1/2 bg-white flex flex-col justify-center px-24">
        
        <img 
          src="/images/logo.png" 
          alt="Logo" 
          className="w-16 mx-auto mb-6 opacity-90"
        />

        <h1 className="text-3xl font-semibold text-[#8C6E63] mb-5 text-center">
          Masuk ke CraftMarket
        </h1>

        <div className="flex gap-5 mb-5 justify-center">
          {[ 
            { src: "/images/facebook.png", w: "w-6" },
            { src: "/images/google.png", w: "w-7" },
            { src: "/images/linkendin.png", w: "w-6" }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="w-11 h-11 rounded-full shadow-sm border border-gray-200 flex items-center justify-center bg-white hover:shadow-md transition cursor-pointer"
            >
              <img src={item.src} className={item.w} />
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-700 mb-5 text-center">
          atau masuk dengan email
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-400 rounded-lg px-4 py-2.5 w-full mb-3 focus:border-[#B89C8A] focus:ring-[#B89C8A] focus:ring-1 outline-none transition placeholder-gray-800 text-gray-900 bg-white"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-400 rounded-lg px-4 py-2.5 w-full mb-4 focus:border-[#B89C8A] focus:ring-[#B89C8A] focus:ring-1 outline-none transition placeholder-gray-800 text-gray-900 bg-white"
          />

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="bg-[#B89C8A] text-white w-full py-2.5 rounded-lg 
            hover:bg-[#A88B78] transition text-center text-base font-medium shadow-sm disabled:opacity-50"
          >
            {loading ? "Sedang masuk..." : "MASUK"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-300 text-center">
          <p className="text-gray-800 text-sm mb-3">
            Belum punya akun?
          </p>
          <Link
            href="/register"
            className="inline-block bg-[#C4B5A5] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#B3A290] transition"
          >
            Silahkan Registrasi
          </Link>
        </div>
      </div>

      <div className="w-1/2 bg-[#CAB1A3] flex flex-col items-center justify-center px-20 text-white">
        <h2 className="text-4xl font-bold mb-3">Halo, Teman!</h2>
        <p className="text-center text-base opacity-90">
          Masukkan data Anda untuk mulai menjelajah.
        </p>

        <button
          onClick={() => router.push("/seller/login")}
          className="mt-6 px-6 py-2 border border-white rounded-lg hover:bg-white hover:text-[#CAB1A3] transition font-medium"
        >
          Ingin menjadi seller?
        </button>
      </div>

    </div>
  );
}
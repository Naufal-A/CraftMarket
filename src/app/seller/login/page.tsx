"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SellerLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // const handleLogin = async () => {
  //   if (!email || !password) {
  //     alert("Email dan password wajib diisi!");
  //     return;
  //   }

  //   try {
  //     const res = await fetch("/api/seller/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       alert(data.message || "Login gagal!");
  //       return;
  //     }

  //     router.push("/seller/dashboard");

  //   } catch (err) {
  //     alert("Terjadi kesalahan server.");
  //   }
  // };

  return (
    <div className="flex h-screen">

      <div className="w-1/2 bg-white flex flex-col justify-center px-24">

        <img src="/images/logo.png" alt="Logo" className="w-20 mb-8 opacity-90 mx-auto" />

        <h1 className="text-4xl font-semibold text-[#8C6E63] mb-6 text-center">
          Masuk ke Seller Centre
        </h1>

        <div className="flex gap-6 mb-6 justify-center">
          {["/images/facebook.png", "/images/google.png", "/images/linkendin.png"].map((src, i) => (
            <div key={i} className="w-14 h-14 rounded-full shadow flex items-center justify-center cursor-pointer bg-white">
              <img src={src} className="w-7" />
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-600 mb-6 text-center">
          atau gunakan akun email Anda
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 focus:border-[#B89C8A] focus:ring-1 focus:ring-[#B89C8A] rounded-md px-4 py-3 w-full mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 focus:border-[#B89C8A] focus:ring-1 focus:ring-[#B89C8A] rounded-md px-4 py-3 w-full mb-4"
        />

        <button
          // onClick={handleLogin}
          onClick={()=> router.push("/seller/dasboard")}
          className="bg-[#B89C8A] text-white w-full py-3 rounded-md hover:bg-[#A88B78] transition text-lg"
        >
          MASUK
        </button>
      </div>

      <div className="w-1/2 bg-[#CAB1A3] flex flex-col items-center justify-center px-20 text-white">
        <h2 className="text-4xl font-bold mb-4">Jadilah Penjual Terbaik</h2>
        <p className="text-center text-lg opacity-90">
          Kelola tokomu dengan mudah melalui CraftMarket Seller Centre.
        </p>

        <button
          onClick={() => router.push("/seller/register")}
          className="mt-6 px-6 py-2 border border-white rounded-lg hover:bg-white hover:text-[#CAB1A3] transition"
        >
          Belum punya akun? Daftar
        </button>
      </div>

    </div>
  );
}

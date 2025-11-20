"use client";

import { useRouter } from "next/navigation";

export default function SellerRegister() {
  const router = useRouter();

  return (
    <div className="flex h-screen">

      <div className="w-1/2 bg-[#CAB1A3] flex flex-col items-center justify-center px-20 text-white">

        <h2 className="text-3xl font-bold mb-3">Daftar sebagai Seller</h2>
        <p className="text-center text-base opacity-90 mb-4">
          Buka tokomu dan mulai menjangkau lebih banyak pelanggan.
        </p>

        <button
          onClick={() => router.push("/seller/login")}
          className="mt-4 px-6 py-2 border border-white rounded-lg hover:bg-white hover:text-[#CAB1A3] transition"
        >
          Sudah punya akun? Login
        </button>
      </div>

      <div className="w-1/2 bg-white flex flex-col justify-center px-24">

        <img
          src="/images/logo.png"
          alt="Logo"
          className="w-20 mx-auto mb-6 opacity-90"
        />

        <h1 className="text-3xl font-semibold text-[#8C6E63] mb-5 text-center">
          Buat Akun Seller
        </h1>

        <div className="flex gap-5 mb-5 justify-center">
          {[ "/images/facebook.png", "/images/google.png", "/images/linkendin.png" ].map((src, i) => (
            <div key={i} className="w-11 h-11 rounded-full shadow-sm border border-gray-200 flex items-center justify-center bg-white hover:shadow-md transition cursor-pointer">
              <img src={src} className="w-6" />
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-5 text-center">
          atau daftar menggunakan email
        </p>

        <input type="text" placeholder="Nama Toko"
          className="border border-gray-300 rounded-lg px-4 py-2.5 w-full mb-3 focus:border-[#B89C8A] focus:ring-1 focus:ring-[#B89C8A] transition"
        />

        <input type="email" placeholder="Email"
          className="border border-gray-300 rounded-lg px-4 py-2.5 w-full mb-3 focus:border-[#B89C8A] focus:ring-1 focus:ring-[#B89C8A] transition"
        />

        <input type="password" placeholder="Password"
          className="border border-gray-300 rounded-lg px-4 py-2.5 w-full mb-4 focus:border-[#B89C8A] focus:ring-1 focus:ring-[#B89C8A] transition"
        />

        <button
          onClick={() => router.push("/seller/login")}
          className="bg-[#B89C8A] text-white w-full py-2.5 rounded-lg hover:bg-[#A88B78] transition text-base font-medium shadow-sm"
        >
          DAFTAR
        </button>
      </div>
    </div>
  );
}

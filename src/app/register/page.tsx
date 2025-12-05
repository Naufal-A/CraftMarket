"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Pendaftaran gagal");
        return;
      }

      // Store user data and redirect to home
      localStorage.setItem("user", JSON.stringify(data.user));
      if (response.ok) {
        router.push("/home");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat pendaftaran");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">

      <div className="w-1/2 bg-[#CAB1A3] flex flex-col items-center justify-center px-20 text-white">
        <h2 className="text-4xl font-bold mb-3">Selamat Datang</h2>
        <p className="text-center text-base opacity-90">
          Silakan daftar untuk mulai menjelajah.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="mt-6 px-6 py-2 border border-white rounded-lg hover:bg-white hover:text-[#CAB1A3] transition"
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
          Buat Akun Baru
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
          atau daftar dengan email
        </p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border border-gray-400 rounded-lg px-4 py-2.5 w-full mb-3 focus:border-[#B89C8A] focus:ring-[#B89C8A] focus:ring-1 outline-none transition placeholder-gray-800 text-gray-900 bg-white"
          />

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
            className="border border-gray-400 rounded-lg px-4 py-2.5 w-full mb-3 focus:border-[#B89C8A] focus:ring-[#B89C8A] focus:ring-1 outline-none transition placeholder-gray-800 text-gray-900 bg-white"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="border border-gray-400 rounded-lg px-4 py-2.5 w-full mb-4 focus:border-[#B89C8A] focus:ring-[#B89C8A] focus:ring-1 outline-none transition placeholder-gray-800 text-gray-900 bg-white"
          />

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="bg-[#B89C8A] text-white w-full py-2.5 rounded-lg hover:bg-[#A88B78] transition text-center text-base font-medium shadow-sm disabled:opacity-50"
          >
            {loading ? "Sedang mendaftar..." : "DAFTAR"}
          </button>
        </form>
      </div>
    </div>
  );
}
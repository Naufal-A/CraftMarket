"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, MessageCircle } from "lucide-react";

const Footer = () => {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-white py-12 px-6 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif text-xl font-bold text-[#A68E74]">
              CraftMarket
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Platform marketplace furnitur berkualitas tinggi dari pengrajin terbaik Indonesia. Kami menghadirkan koleksi furniture yang indah, fungsional, dan tahan lama untuk rumah Anda.
            </p>
          </div>

          {/* Products Section */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4 text-sm">
              Produk
            </h4>
            <div className="space-y-2 text-sm">
              <Link href="/" className="text-gray-600 hover:text-[#8C735A] transition block">
                Furnitur Ruang Tamu
              </Link>
              <Link href="/" className="text-gray-600 hover:text-[#8C735A] transition block">
                Furnitur Kamar Tidur
              </Link>
              <Link href="/" className="text-gray-600 hover:text-[#8C735A] transition block">
                Furnitur Dapur
              </Link>
              <Link href="/" className="text-gray-600 hover:text-[#8C735A] transition block">
                Dekorasi Rumah
              </Link>
            </div>
          </div>

          {/* Services Section */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4 text-sm">
              Layanan
            </h4>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">Desain Kreatif</p>
              <p className="text-gray-600">Konsultasi Gratis</p>
              <p className="text-gray-600">Furnitur Custom</p>
              <p className="text-gray-600">Pengiriman Ke Seluruh Indonesia</p>
            </div>
          </div>

          {/* Back to Top */}
          <div className="flex justify-end">
            <button
              onClick={handleBackToTop}
              className="bg-[#C4B5A5] hover:bg-[#B3A290] text-white px-10 py-0 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              BACK TO TOP
              <span className="text-2xl leading-none">↑</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-gray-200 py-4" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
          {/* Social Media Icons */}
          <div className="flex gap-3">
            <Link
              href="/"
              className="text-green-500 hover:text-green-600 transition-colors"
            >
              <MessageCircle size={20} />
            </Link>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Facebook size={20} />
            </Link>
            <Link
              href="/"
              className="text-pink-600 hover:text-pink-700 transition-colors"
            >
              <Instagram size={20} />
            </Link>
            <Link
              href="/"
              className="text-blue-500 hover:text-blue-600 transition-colors"
            >
              <Linkedin size={20} />
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-gray-800 text-xs">
            &copy; 2024 CraftMarket. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
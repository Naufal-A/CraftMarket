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
            {/* Placeholder Lines */}
            <div className="space-y-2">
              <div className="h-3 bg-gray-300 rounded w-20"></div>
              <div className="h-3 bg-gray-300 rounded w-24"></div>
              <div className="h-3 bg-gray-300 rounded w-20"></div>
            </div>
          </div>

          {/* Products Section */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4 text-sm">
              Products
            </h4>
            {/* Placeholder Lines */}
            <div className="space-y-2">
              <div className="h-2 bg-gray-300 rounded w-full"></div>
              <div className="h-2 bg-gray-300 rounded w-full"></div>
              <div className="h-2 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>

          {/* Services Section */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4 text-sm">
              Services
            </h4>
            {/* Placeholder Lines */}
            <div className="space-y-2">
              <div className="h-2 bg-gray-300 rounded w-full"></div>
              <div className="h-2 bg-gray-300 rounded w-full"></div>
              <div className="h-2 bg-gray-300 rounded w-3/4"></div>
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
          <p className="text-gray-600 text-xs">
            &copy; 2024 CraftMarket. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
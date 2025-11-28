"use client";

import { Star, Image as ImageIcon } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const BuyerHomePage = () => {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        setCartCount(Array.isArray(cart) ? cart.length : 0);
      } catch (err) {
        console.error("Error parsing cart:", err);
      }
    }
  }, []);

  useEffect(() => {
    const section = searchParams.get("section");
    if (section) {
      const element = document.getElementById(section);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [searchParams]);
  const testimonials = [
    {
      name: "Nom e-Owner",
      rating: 5,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      name: "Nom e-Owner",
      rating: 5,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      name: "Nom e-Owner",
      rating: 5,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      name: "Nom e-Owner",
      rating: 5,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  ];

  return (
    <>
      <Header cartCount={cartCount} />
      <main className="w-full bg-white pt-0">
      {/* === HERO SECTION === */}
      <section id="home" className="flex flex-col items-center pt-10 pb-20 px-6 scroll-mt-20">
        <h1 className="text-5xl md:text-6xl font-serif text-[#8C735A] mb-6">
          CraftMarket
        </h1>

        <p className="text-gray-600 text-center mb-12 max-w-2xl leading-relaxed">
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>

        {/* Hero Image Placeholder */}
        <div className="w-full max-w-3xl aspect-video bg-[#EAECF0] rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-300">
          <ImageIcon className="w-24 h-24 text-gray-400" />
        </div>
      </section>

      {/* === WELCOME MESSAGE === */}
      {user && (
        <section className="w-full bg-[#F5F5F5] py-10 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-[#8C735A] mb-2">
              Selamat Datang, {user.name}!
            </h2>
            <p className="text-gray-600">
              Jelajahi koleksi produk kerajinan terbaik dari pengrajin lokal.
            </p>
          </div>
        </section>
      )}

      {/* === ABOUT US SECTION === */}
      <section id="about" className="w-full bg-gray-50 py-20 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-start">
          {/* Left Column: Text */}
          <div className="flex-1">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
              About Us
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#A68E74] mb-6 mt-2">
              CraftMarket
            </h2>

            {/* Placeholder untuk deskripsi About */}

            <p className="text-gray-700 leading-relaxed mb-8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>

            <p className="text-gray-700 leading-relaxed mb-8">
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
            </p>

            {/* Button */}
            <button className="bg-[#C4B5A5] hover:bg-[#B3A290] text-white text-sm font-semibold py-3 px-8 rounded-md transition-all" onClick={() => window.location.href = '/products'}>
              SEE PRODUCTS
            </button>
          </div>

          {/* Right Column: Image Placeholder */}
          <div className="flex-1 w-full">
            <div className="aspect-square bg-[#EAECF0] rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <ImageIcon className="w-32 h-32 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* === SERVICES SECTION === */}
      <section id="services" className="w-full py-20 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
            Services
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#8C735A] mb-16 mt-2">
            Explore Our Services
          </h2>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-gray-50 p-8 rounded-xl text-center">
              <div className="w-12 h-12 bg-[#C4B5A5] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">🛋️</span>
              </div>
              <h3 className="text-xl font-semibold text-[#8C735A] mb-3">
                Custom Furniture
              </h3>
              <p className="text-gray-600 text-sm">
                Layanan furnitur custom kami akan ditampilkan di sini
              </p>
            </div>

            {/* Service 2 */}
            <div className="bg-gray-50 p-8 rounded-xl text-center">
              <div className="w-12 h-12 bg-[#C4B5A5] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-[#8C735A] mb-3">
                Free Consultation
              </h3>
              <p className="text-gray-600 text-sm">
                Konsultasi gratis kami akan ditampilkan di sini
              </p>
            </div>

            {/* Service 3 */}
            <div className="bg-gray-50 p-8 rounded-xl text-center">
              <div className="w-12 h-12 bg-[#C4B5A5] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">✏️</span>
              </div>
              <h3 className="text-xl font-semibold text-[#8C735A] mb-3">
                Custom Design
              </h3>
              <p className="text-gray-600 text-sm">
                Desain custom kami akan ditampilkan di sini
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === CUSTOM SECTION === */}
      <section id="custom" className="w-full py-20 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
            Custom
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#8C735A] mb-16 mt-2">
            Custom Solutions
          </h2>

          {/* Custom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Custom 1 */}
            <div className="bg-gray-50 p-8 rounded-xl text-center">
              <div className="w-12 h-12 bg-[#C4B5A5] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">🛋️</span>
              </div>
              <h3 className="text-xl font-semibold text-[#8C735A] mb-3">
                Custom Furniture
              </h3>
              <p className="text-gray-600 text-sm">
                Layanan furnitur custom kami akan ditampilkan di sini
              </p>
            </div>

            {/* Custom 2 */}
            <div className="bg-gray-50 p-8 rounded-xl text-center">
              <div className="w-12 h-12 bg-[#C4B5A5] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-[#8C735A] mb-3">
                Free Consultation
              </h3>
              <p className="text-gray-600 text-sm">
                Konsultasi gratis kami akan ditampilkan di sini
              </p>
            </div>

            {/* Custom 3 */}
            <div className="bg-gray-50 p-8 rounded-xl text-center">
              <div className="w-12 h-12 bg-[#C4B5A5] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">✏️</span>
              </div>
              <h3 className="text-xl font-semibold text-[#8C735A] mb-3">
                Custom Design
              </h3>
              <p className="text-gray-600 text-sm">
                Desain custom kami akan ditampilkan di sini
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === TESTIMONIALS SECTION === */}
      <section className="w-full bg-gray-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#8C735A] mb-12 mt-2">
            What They Say About{" "}
            <span className="text-[#A68E74]">CraftMarket</span>
          </h2>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array(testimonial.rating)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className="fill-yellow-400 text-yellow-400"
                        />
                      ))}
                  </div>

                  {/* Text */}
                  <p className="text-gray-700 text-sm mb-4">{testimonial.text}</p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                      N
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-gray-500">Owner</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* === CONTACT US SECTION === */}
      <section id="contact" className="w-full py-20 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
            Contact Us
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#8C735A] mb-12 mt-2">
            Let&apos;s Get In Touch
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Image */}
            <div className="aspect-square bg-[#EAECF0] rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <ImageIcon className="w-32 h-32 text-gray-400" />
            </div>

            {/* Right: Form */}
            <div>
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#C4B5A5] focus:ring-1 focus:ring-[#C4B5A5] outline-none transition placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="+62 123 456 789"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#C4B5A5] focus:ring-1 focus:ring-[#C4B5A5] outline-none transition placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#C4B5A5] focus:ring-1 focus:ring-[#C4B5A5] outline-none transition placeholder-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service *
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#C4B5A5] focus:ring-1 focus:ring-[#C4B5A5] outline-none transition">
                      <option>Select service</option>
                      <option>$ 0 - 500K</option>
                      <option>$ 500K - 1M</option>
                      <option>$ 1M+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Type *
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#C4B5A5] focus:ring-1 focus:ring-[#C4B5A5] outline-none transition">
                      <option>Select type</option>
                      <option>Furniture</option>
                      <option>Crafts</option>
                      <option>Custom</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Tell us more about your project..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#C4B5A5] focus:ring-1 focus:ring-[#C4B5A5] outline-none transition resize-none placeholder-gray-600"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C4B5A5] hover:bg-[#B3A290] text-white font-semibold py-3 rounded-lg transition-all"
                >
                  GET CONSULTATION
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
};

export default BuyerHomePage;

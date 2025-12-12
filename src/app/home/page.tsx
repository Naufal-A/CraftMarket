"use client";

import Image from "next/image";
import { Star } from "lucide-react";
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
    const loadCart = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }

        const userId = localStorage.getItem("userId");
        if (userId) {
          // Load from database
          const response = await fetch(`/api/cart?buyerId=${userId}`);
          if (response.ok) {
            const cartData = await response.json();
            setCartCount(cartData.items?.length || 0);
          }
        } else {
          // Fallback to localStorage
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            try {
              const cart = JSON.parse(savedCart);
              setCartCount(Array.isArray(cart) ? cart.length : 0);
            } catch (err) {
              console.error("Error parsing cart:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error loading cart:", err);
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          try {
            const cart = JSON.parse(savedCart);
            setCartCount(Array.isArray(cart) ? cart.length : 0);
          } catch (e) {
            console.error("Error parsing cart:", e);
          }
        }
      }
    };

    loadCart();
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
      name: "Siti Nurhaliza",
      rating: 5,
      text: "Furnitur dari CraftMarket benar-benar mengubah penampilan ruang tamu saya. Kualitasnya luar biasa dan desainnya sangat elegan. Saya sangat puas dengan pembelian saya!",
    },
    {
      name: "Budi Santoso",
      rating: 5,
      text: "Sebagai pengusaha, saya membutuhkan furnitur kantor yang profesional. CraftMarket memberikan pilihan yang sempurna dengan harga yang kompetitif. Pelayanannya juga sangat responsif!",
    },
    {
      name: "Maya Wijaya",
      rating: 5,
      text: "Saya memesan sofa custom dan hasilnya melampaui ekspektasi saya. Pengrajin benar-benar memahami visi saya dan mewujudkannya dengan sempurna. Terima kasih CraftMarket!",
    },
    {
      name: "Ahmad Rizki",
      rating: 5,
      text: "Proses pemesanan sangat mudah dan pengiriman cepat. Meja makan yang saya beli ternyata lebih bagus dari foto. Pasti akan merekomendasikan ke teman dan keluarga saya!",
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

        <p className="text-gray-800 text-center mb-12 max-w-2xl leading-relaxed">
          Temukan koleksi furnitur berkualitas tinggi yang dirancang khusus oleh para pengrajin berbakat. Setiap produk dibuat dengan perhatian terhadap detail dan menggunakan material terbaik untuk kenyamanan Anda.
        </p>

        {/* Hero Image */}
        <div className="w-full max-w-3xl aspect-video rounded-3xl overflow-hidden shadow-lg">
          <Image
            src="/images/rooftop-seating-wooden-stool.jpg"
            alt="CraftMarket - Furnitur berkualitas tinggi"
            width={1200}
            height={675}
            priority
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* === WELCOME MESSAGE === */}
      {user && (
        <section className="w-full bg-[#F5F5F5] py-10 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-[#8C735A] mb-2">
              Selamat Datang, {user.name}!
            </h2>
            <p className="text-gray-800">
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
              CraftMarket adalah platform marketplace yang menghubungkan Anda dengan pengrajin furnitur terbaik di Indonesia. Kami percaya bahwa setiap rumah membutuhkan furnitur yang tidak hanya indah secara visual, tetapi juga fungsional dan tahan lama. Melalui CraftMarket, Anda dapat menemukan berbagai pilihan furnitur yang diproduksi dengan keahlian tinggi dan dedikasi terhadap kualitas.
            </p>

            <p className="text-gray-700 leading-relaxed mb-8">
              Dari meja makan minimalis modern hingga sofa yang nyaman untuk bersantai, setiap produk dipilih dengan cermat untuk memastikan kepuasan Anda. Tim pengrajin kami bekerja tanpa henti untuk menciptakan furnitur yang mencerminkan gaya hidup Anda dan meningkatkan nilai estetika rumah Anda.
            </p>

            {/* Button */}
            <button className="bg-[#C4B5A5] hover:bg-[#B3A290] text-white text-sm font-semibold py-3 px-8 rounded-md transition-all" onClick={() => window.location.href = '/products'}>
              SEE PRODUCTS
            </button>
          </div>

          {/* Right Column: Image */}
          <div className="flex-1 w-full">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/about-us.jpg"
                alt="CraftMarket - Tentang kami"
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
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
            Layanan Kami
          </h2>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-gray-50 p-8 rounded-xl text-center">
              <div className="w-12 h-12 bg-[#C4B5A5] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">🛋️</span>
              </div>
              <h3 className="text-xl font-semibold text-[#8C735A] mb-3">
                Furnitur Custom
              </h3>
              <p className="text-gray-600 text-sm">
                Desain dan buat furnitur impian Anda sesuai dengan preferensi dan ruang yang Anda miliki. Tim desainer profesional kami siap membantu mewujudkan visi Anda.
              </p>
            </div>

            {/* Service 2 */}
            <div className="bg-gray-50 p-8 rounded-xl text-center">
              <div className="w-12 h-12 bg-[#C4B5A5] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-[#8C735A] mb-3">
                Konsultasi Gratis
              </h3>
              <p className="text-gray-600 text-sm">
                Dapatkan saran gratis dari para ahli furniture untuk memilih produk yang paling sesuai dengan kebutuhan dan budget Anda.
              </p>
            </div>

            {/* Service 3 */}
            <div className="bg-gray-50 p-8 rounded-xl text-center">
              <div className="w-12 h-12 bg-[#C4B5A5] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">✏️</span>
              </div>
              <h3 className="text-xl font-semibold text-[#8C735A] mb-3">
                Desain Kreatif
              </h3>
              <p className="text-gray-600 text-sm">
                Kreativitas tanpa batas untuk menciptakan furnitur yang unik dan sesuai dengan kepribadian serta gaya dekorasi rumah Anda.
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
                      <p className="text-xs text-gray-500">Pelanggan</p>
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
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/creepy-unexplainable-phone-calls.jpeg"
                alt="CraftMarket - Hubungi kami"
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
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

'use client';

import Link from 'next/link';


const footerLinks = [
  {
    title: 'Products',
    links: ['Artisan Goods', 'Custom Orders', 'Gift Sets', 'Seasonal Items', 'Wholesale'],
  },
  {
    title: 'Services',
    links: ['Shipping Policy', 'Return Policy', 'FAQ', 'Track Order', 'Contact Support'],
  },
];

const socialIcons = [
  { name: 'WhatsApp', icon: '📞', href: '#' }, // Ganti ikon dengan SVG/ikon library nyata
  { name: 'Facebook', icon: '📘', href: '#' },
  { name: 'Instagram', icon: '📸', href: '#' },
  { name: 'LinkedIn', icon: '👔', href: '#' },
];

// Fungsi untuk menggulir ke atas halaman
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

export default function Footer() {
  const brandColor = 'text-amber-700';
  const buttonBgColor = 'bg-[#C4B5A5] '; // Background tombol Back to Top

  return (
    <footer className="bg-gray-100 border- border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* === Baris Atas: Konten Utama Footer === */}
        <div className="flex flex-col md:flex-row justify-between">
          
          {/* A. Kolom Brand & Deskripsi (Kiri) */}
          <div className="w-full md:w-2/5 mb-8 md:mb-0">
            <h2 className={`text-2xl font-bold ${brandColor} tracking-tight`}>
              CraftMarket
            </h2>
            <p className="text-sm text-gray-600 mt-4 max-w-sm">
              Discover unique handcrafted products from talented artisans around the globe. Quality and passion in every item.
            </p>
            
            {/* Ikon Media Sosial (Di luar flex kolom di desain) */}
            <div className="flex space-x-4 mt-6">
              {socialIcons.map((item) => (
                <Link key={item.name} href={item.href} className={`text-2xl text-gray-700 hover:${brandColor}`}>
                  {item.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* B. Kolom Links & Back to Top (Tengah & Kanan) */}
          <div className="flex justify-between w-full md:w-3/5">
            
            {/* Kolom Links (Products & Services) */}
            <div className="flex space-x-12 sm:space-x-20">
              {footerLinks.map((column) => (
                <div key={column.title}>
                  <h3 className="font-semibold text-gray-800 mb-4">{column.title}</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {column.links.map((link) => (
                      <li key={link}>
                        <Link href="#" className="hover:text-gray-900 transition duration-150">
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            {/* Tombol Back to Top (Paling Kanan) */}
            <div className="self-start mt-0">
              <button 
                onClick={scrollToTop}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm ${buttonBgColor} text-white shadow-md hover:shadow-lg transition duration-300`}
              >
                <span>BACK TO TOP</span>
                <span>⬆️</span> {/* Ikon panah ke atas */}
              </button>
            </div>
            
          </div>
        </div>

        {/* === Baris Bawah: Copyright / Garis Pemisah === */}
        <div className="mt-5 pt-5 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} CraftMarket. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
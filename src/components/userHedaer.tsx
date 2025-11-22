// components/BuyerHeader.js
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '#about' },
  { label: 'Products', path: '/items' },
  { label: 'Services', path: '/services' },
  { label: 'Contact Us', path: '/contact' },
];

export default function BuyerHeader({ activePath = '/' }) {
  const activeBorderColor = 'border-amber-700';
  const router = useRouter();

  return (
    <header className="bg-gray-100 border-b border-gray-200">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        
        {/* === Kiri: Logo dan Nama Brand === */}
        <div className="flex items-end">
          <Link href="/" className="flex flex-col items-center group">
           <img src="/images/logo.png" alt="Logo" className="w-15 opacity-90 mx-auto" />
          </Link>
        </div>

        {/* === Kanan: Navigasi === */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            {NAV_ITEMS.map((item) => {
              const isActive = item.path === activePath;
              
              return (
                <li key={item.path}>
                  <Link 
                    href={item.path} 
                    className={`
                      text-gray-700 hover:text-gray-900 transition duration-150 ease-in-out
                      ${isActive 
                        ? `font-bold border-b-2 ${activeBorderColor} text-gray-900` // Style aktif (underline tebal)
                        : 'font-normal border-b-2 border-transparent' // Style tidak aktif
                      }
                      pb-1.5
                    `}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button className="text-sm font-semibold text-gray-700 hover:text-gray-900 border border-gray-400 px-4 py-2 rounded-md transition duration-150"
        onClick={() => router.push("/login")}>
            LOGIN
           
        </button>

      </div>
    </header>
  );
}
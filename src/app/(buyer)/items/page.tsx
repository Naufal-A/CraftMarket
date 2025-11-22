import React from 'react';
import { Search, ChevronDown, Image as ImageIcon, Star, ChevronRight } from 'lucide-react';

// --- Types ---
interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  rating: number;
}

// --- Mock Data ---
const products: Product[] = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  name: 'Item Name',
  description: 'Item Description',
  price: '$$$$$',
  rating: 5,
}));

export default function ExplorePage() {
  return (
     <div className="min-h-screen bg-white py-12 px-4 flex justify-center items-start">
      
      <main className="w-full max-w-6xl bg-white shadow-xl rounded-2xl p-6 md:p-12">
        
        {/* --- Header Section --- */}
        <div className="text-center mb-10">
          <h1 className="text-[#A68E74] font-serif text-xl font-bold mb-2">
            CraftMarket
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Explore Our Products
          </h2>
        </div>

        {/* --- Search & Filter Bar --- */}
        <div className="flex flex-col md:flex-row items-center justify-between border border-gray-200 rounded-full px-6 py-3 shadow-sm mb-8 gap-4 bg-white">
          {/* Search Input */}
          <div className="flex items-center flex-1 w-full md:w-auto gap-3">
            <Search className="w-5 h-5 text-green-600" />
            <input 
              type="text" 
              placeholder="Search product name, design, or type" 
              className="flex-1 outline-none text-gray-600 placeholder-gray-300 bg-transparent"
            />
          </div>

          <div className="hidden md:block w-px h-6 bg-gray-200 mx-2"></div>

          {/* Filters */}
          <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-end">
             {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-16 md:w-20 h-2.5 bg-gray-200 rounded-full group-hover:bg-gray-300 transition"></div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
             ))}
          </div>
        </div>

        {/* --- Showing Results Text --- */}
        <div className="mb-6 text-sm text-gray-400">
          Showing results
        </div>

        {/* --- Product Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 mb-16">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <Pagination />
      </main>
    </div>
  );
}

// --- Sub-Component: Product Card ---
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex flex-row gap-5 items-start">
      <div className="w-36 h-28 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-100">
        <ImageIcon className="w-10 h-10 text-gray-300 stroke-[1.5]" />
      </div>

      <div className="flex flex-col pt-1">
        <h3 className="font-bold text-gray-800 text-lg mb-1">{product.name}</h3>
        <p className="text-gray-300 text-sm mb-2">{product.description}</p>
        <p className="font-semibold text-gray-700 mb-2">{product.price}</p>
        <div className="flex gap-1">
          {[...Array(product.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Sub-Component: Pagination ---
function Pagination() {
  return (
    <div className="flex justify-center items-center gap-3">
      <button className="w-10 h-10 flex items-center justify-center bg-[#C4B5A5] text-white font-bold text-sm rounded shadow-sm hover:bg-[#b09f8e] transition">1</button>
      <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-gray-400 font-bold text-sm rounded hover:border-gray-300 transition">2</button>
      <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-gray-400 font-bold text-sm rounded hover:border-gray-300 transition">3</button>
      <button className="w-10 h-10 flex items-center justify-center bg-[#C4B5A5] text-white rounded hover:bg-[#b09f8e] transition"><ChevronRight className="w-4 h-4" /></button>
    </div>
  );
}
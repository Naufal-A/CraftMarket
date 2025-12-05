"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit2, LayoutDashboard, ShoppingCart, PackageSearch, LogOut } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  rating: number;
  reviews: number;
}

export default function ProductsPage() {
  const [active, setActive] = useState("products");
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Regular Product Form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Furniture",
    stock: "",
    image: "",
  });





  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/seller/login");
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        const productsList = Array.isArray(data) ? data : data.products || [];
        setProducts(productsList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitRegular = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.description || !formData.price || !formData.stock) {
      setError("Semua field wajib diisi!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      const userData = user ? JSON.parse(user) : null;

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          sellerId: userData?._id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal menambah produk!");
        return;
      }

      setProducts([...products, data.product]);
      setSuccess("Produk berhasil ditambahkan!");
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "Furniture",
        stock: "",
        image: "",
      });
      setShowForm(false);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error:", err);
      setError("Terjadi kesalahan server!");
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("Gagal menghapus produk!");
        return;
      }

      setProducts(products.filter((p) => p._id !== productId));
      setSuccess("Produk berhasil dihapus!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error:", err);
      setError("Terjadi kesalahan saat menghapus produk!");
    }
  };

  return (
    <div className="flex h-screen bg-[#F4EFEA]">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-[#DCC8B9] h-full p-8 flex flex-col shadow-md fixed">
        <div className="text-xl font-bold text-[#4A3B32] mb-8 tracking-wide">
          Marketplace Dashboard
        </div>

        <div className="flex flex-col gap-3 text-[#4A3B32] font-medium">
          {[
            { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
            { key: "orders", label: "Orders", icon: <ShoppingCart size={18} /> },
            { key: "products", label: "Products", icon: <PackageSearch size={18} /> },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActive(item.key);
                if (item.key === "dashboard") {
                  router.push("/seller/dasboard");
                } else if (item.key === "products") {
                  router.push("/seller/products");
                }
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                active === item.key
                  ? "bg-white shadow-sm text-[#3B2E27]"
                  : "hover:bg-white/40"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto ml-72">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-[#4A3B32] mb-4">
            Product Management
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl font-semibold text-[#4A3B32]">
              {products.length}
            </div>
            <div className="text-sm text-red-500 font-medium">Total Product</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl font-semibold text-[#4A3B32]">
              {products.filter((p) => p.stock > 0).length}
            </div>
            <div className="text-sm text-green-500 font-medium">Active</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl font-semibold text-[#4A3B32]">
              {products.filter((p) => p.stock > 0 && p.stock < 5).length}
            </div>
            <div className="text-sm text-yellow-500 font-medium">Low Stock</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl font-semibold text-[#4A3B32]">
              {products.filter((p) => p.stock === 0).length}
            </div>
            <div className="text-sm text-red-500 font-medium">Out Of Stock</div>
          </div>
        </div>

        {/* Add Product Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4 flex-1">
            <input
              type="text"
              placeholder="Search Orders, Curtomers"
              className="flex-1 px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:border-[#C2AFA3] placeholder-gray-700"
            />
            <select className="px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:border-[#C2AFA3] text-gray-900">
              <option>All Statuses</option>
            </select>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#B89C8A] hover:bg-[#A88B78] text-white px-6 py-3 rounded-lg font-medium transition ml-4"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Add Product Form */}
        {showForm && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-2xl font-semibold text-[#4A3B32] mb-6">
              Tambah Produk Baru
            </h2>

            {/* Regular Product Form */}
            <form onSubmit={handleSubmitRegular} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Produk *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama produk"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C2AFA3] placeholder-gray-600 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C2AFA3] text-gray-900"
                    >
                      <option>Furniture</option>
                      <option>Crafts</option>
                      <option>Accessories</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Masukkan deskripsi produk"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C2AFA3] placeholder-gray-600 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gambar Produk *
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setFormData({ ...formData, image: event.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C2AFA3]"
                      required={!formData.image}
                    />
                    {formData.image && (
                      <Image
                        src={formData.image}
                        alt="Preview"
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga (Rp) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Masukkan harga"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C2AFA3] placeholder-gray-600 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stok *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="Masukkan jumlah stok"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C2AFA3] placeholder-gray-600 text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#B89C8A] hover:bg-[#A88B78] text-white px-6 py-3 rounded-lg font-medium transition"
                  >
                    Tambah Produk
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-gray-800 px-6 py-3 rounded-lg font-medium transition"
                  >
                    Batal
                  </button>
                </div>
              </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Belum ada produk. Tambahkan produk baru untuk memulai!
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-700">
                            {product.description.substring(0, 50)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        Rp{product.price.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.stock > 0
                              ? product.stock < 5
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.stock} item
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        ⭐ {product.rating} ({product.reviews} reviews)
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-blue-100 rounded-lg transition">
                            <Edit2 size={18} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}

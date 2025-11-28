"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Upload, X } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface CustomProduct {
  _id?: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  materials: string[];
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  customizationOptions: {
    material: string[];
    color: string[];
    design: string[];
  };
  modelImages: string[];
  deliveryTime: string;
  warranty: string;
}

export default function CustomProductPage() {
  const [products] = useState<CustomProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const [formData, setFormData] = useState<CustomProduct>({
    name: "",
    description: "",
    basePrice: 0,
    category: "Custom",
    materials: [],
    dimensions: { length: 0, width: 0, height: 0, unit: "cm" },
    customizationOptions: {
      material: [],
      color: [],
      design: [],
    },
    modelImages: [],
    deliveryTime: "",
    warranty: "",
  });

  const [newMaterial, setNewMaterial] = useState("");
  const [materialColorInputs, setMaterialColorInputs] = useState<string[]>([]);
  const [designInputs, setDesignInputs] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Load cart count
  useEffect(() => {
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

  // Fetch custom products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Placeholder untuk fetch custom products
        // const res = await fetch("/api/custom-products");
        // const data = await res.json();
        // setProducts(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const readers: Promise<string>[] = [];
      for (let i = 0; i < files.length; i++) {
        readers.push(
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve(event.target?.result as string);
            };
            reader.readAsDataURL(files[i]);
          })
        );
      }

      Promise.all(readers).then((images) => {
        setUploadedImages([...uploadedImages, ...images]);
        setFormData({
          ...formData,
          modelImages: [...formData.modelImages, ...images],
        });
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setFormData({
      ...formData,
      modelImages: newImages,
    });
  };

  const handleAddMaterial = () => {
    if (newMaterial.trim()) {
      setFormData({
        ...formData,
        materials: [...formData.materials, newMaterial],
      });
      setNewMaterial("");
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter((_, i) => i !== index),
    });
  };

  const handleAddColor = (color: string) => {
    if (color.trim()) {
      setFormData({
        ...formData,
        customizationOptions: {
          ...formData.customizationOptions,
          color: [...formData.customizationOptions.color, color],
        },
      });
      const newColorInputs = [...materialColorInputs];
      newColorInputs[newColorInputs.length - 1] = "";
      setMaterialColorInputs(newColorInputs);
    }
  };

  const handleRemoveColor = (index: number) => {
    setFormData({
      ...formData,
      customizationOptions: {
        ...formData.customizationOptions,
        color: formData.customizationOptions.color.filter((_, i) => i !== index),
      },
    });
  };

  const handleAddDesign = (design: string) => {
    if (design.trim()) {
      setFormData({
        ...formData,
        customizationOptions: {
          ...formData.customizationOptions,
          design: [...formData.customizationOptions.design, design],
        },
      });
      const newDesignInputs = [...designInputs];
      newDesignInputs[newDesignInputs.length - 1] = "";
      setDesignInputs(newDesignInputs);
    }
  };

  const handleRemoveDesign = (index: number) => {
    setFormData({
      ...formData,
      customizationOptions: {
        ...formData.customizationOptions,
        design: formData.customizationOptions.design.filter((_, i) => i !== index),
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || formData.basePrice === 0) {
      alert("Isi semua field wajib!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      const userData = user ? JSON.parse(user) : null;

      const payload = {
        ...formData,
        sellerId: userData?._id,
        stock: 1, // Custom products always have stock = 1
      };

      const res = await fetch("/api/custom-products", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingId ? { ...payload, _id: editingId } : payload),
      });

      if (!res.ok) throw new Error("Failed to save product");

      alert(editingId ? "Produk updated!" : "Produk custom dibuat!");
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (err) {
      console.error("Error:", err);
      alert("Gagal menyimpan produk custom");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      basePrice: 0,
      category: "Custom",
      materials: [],
      dimensions: { length: 0, width: 0, height: 0, unit: "cm" },
      customizationOptions: {
        material: [],
        color: [],
        design: [],
      },
      modelImages: [],
      deliveryTime: "",
      warranty: "",
    });
    setUploadedImages([]);
    setMaterialColorInputs([]);
    setDesignInputs([]);
  };

  return (
    <>
      <Header cartCount={cartCount} />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-r from-[#8C735A] to-[#A68E74] text-white py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">Custom Product Builder</h1>
            <p className="text-lg opacity-90">
              Buat produk custom dengan model dan spesifikasi sesuai keinginan
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Add Button */}
          <div className="mb-8">
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) resetForm();
              }}
              className="flex items-center gap-2 bg-[#8C735A] hover:bg-[#7A6248] text-white px-6 py-3 rounded-lg font-medium transition"
            >
              <Plus size={20} />
              {showForm ? "Batal" : "Buat Produk Custom"}
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingId ? "Edit Produk Custom" : "Produk Custom Baru"}
              </h2>

              {/* Basic Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Informasi Dasar
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Produk *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8C735A] placeholder-gray-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8C735A] placeholder-gray-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Harga Base (Rp) *
                      </label>
                      <input
                        type="number"
                        value={formData.basePrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            basePrice: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8C735A] placeholder-gray-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Waktu Pengiriman *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 5-7 hari"
                        value={formData.deliveryTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deliveryTime: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8C735A] placeholder-gray-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Garansi
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 1 tahun"
                      value={formData.warranty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          warranty: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8C735A] placeholder-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Dimensions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Dimensi
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Panjang
                    </label>
                    <input
                      type="number"
                      value={formData.dimensions.length}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: {
                            ...formData.dimensions,
                            length: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8C735A] placeholder-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lebar
                    </label>
                    <input
                      type="number"
                      value={formData.dimensions.width}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: {
                            ...formData.dimensions,
                            width: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8C735A] placeholder-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tinggi
                    </label>
                    <input
                      type="number"
                      value={formData.dimensions.height}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: {
                            ...formData.dimensions,
                            height: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8C735A] placeholder-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Bahan yang Tersedia
                </h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Tambah bahan (e.g., Kayu Jati)"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8C735A]"
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    Tambah
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.materials.map((material, idx) => (
                    <div
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2"
                    >
                      <span>{material}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(idx)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Pilihan Warna
                </h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Tambah warna (e.g., Hitam, Putih)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8C735A]"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddColor((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector(
                        'input[placeholder="Tambah warna (e.g., Hitam, Putih)"]'
                      ) as HTMLInputElement;
                      if (input) {
                        handleAddColor(input.value);
                        input.value = "";
                      }
                    }}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
                  >
                    Tambah
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.customizationOptions.color.map((color, idx) => (
                    <div
                      key={idx}
                      className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full flex items-center gap-2"
                    >
                      <span>{color}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Designs */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Pilihan Desain
                </h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Tambah desain (e.g., Minimalis, Modern)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8C735A]"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddDesign((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector(
                        'input[placeholder="Tambah desain (e.g., Minimalis, Modern)"]'
                      ) as HTMLInputElement;
                      if (input) {
                        handleAddDesign(input.value);
                        input.value = "";
                      }
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    Tambah
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.customizationOptions.design.map((design, idx) => (
                    <div
                      key={idx}
                      className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center gap-2"
                    >
                      <span>{design}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDesign(idx)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Images */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Gambar Model Produk
                </h3>
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-[#8C735A] transition block">
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={32} className="text-gray-400" />
                    <span className="text-gray-600 font-medium">
                      Klik atau drag gambar model
                    </span>
                    <span className="text-sm text-gray-500">
                      Bisa upload banyak gambar (JPG, PNG)
                    </span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {/* Uploaded Images Preview */}
                {uploadedImages.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Gambar yang sudah diupload ({uploadedImages.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedImages.map((image, idx) => (
                        <div key={idx} className="relative group">
                          <Image
                            src={image}
                            alt={`Model ${idx}`}
                            width={200}
                            height={128}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#8C735A] text-white py-3 rounded-lg font-semibold hover:bg-[#7A6248] transition"
                >
                  {editingId ? "Update Produk" : "Buat Produk Custom"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          {/* Products List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">
                Belum ada produk custom. Mulai dengan membuat yang pertama!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 mt-1">{product.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#8C735A]">
                          Rp{product.basePrice.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

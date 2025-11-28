import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  sellerId: string;
  images: string[];
  stock: number;
  rating: number;
  reviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Nama produk harus diisi'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Deskripsi produk harus diisi'],
    },
    price: {
      type: Number,
      required: [true, 'Harga produk harus diisi'],
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Kategori harus diisi'],
      enum: ['Furniture', 'Crafts', 'Custom', 'Accessories'],
    },
    sellerId: {
      type: String,
      required: [true, 'Seller ID harus diisi'],
    },
    images: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, 'Stok harus diisi'],
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

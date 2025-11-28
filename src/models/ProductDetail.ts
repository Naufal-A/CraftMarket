import mongoose, { Schema, Document } from 'mongoose';

export interface IProductDetail extends Document {
  productId: string;
  material?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  weight?: number;
  color?: string;
  customizable: boolean;
  customizationOptions?: string[];
  deliveryTime?: string;
  shippingCost?: number;
  warranty?: string;
  careInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductDetailSchema = new Schema<IProductDetail>(
  {
    productId: {
      type: String,
      required: [true, 'Product ID harus diisi'],
      unique: true,
    },
    material: {
      type: String,
      trim: true,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    weight: {
      type: Number,
      min: 0,
    },
    color: {
      type: String,
      trim: true,
    },
    customizable: {
      type: Boolean,
      default: false,
    },
    customizationOptions: {
      type: [String],
      default: [],
    },
    deliveryTime: {
      type: String,
      default: '5-7 hari kerja',
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    warranty: {
      type: String,
      trim: true,
    },
    careInstructions: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ProductDetail || mongoose.model<IProductDetail>('ProductDetail', ProductDetailSchema);

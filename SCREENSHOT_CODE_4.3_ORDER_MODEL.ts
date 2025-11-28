// 4.3 ORDER MODEL
// File: src/models/Order.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  customizationDetails?: {
    material?: string;
    color?: string;
    design?: string;
  };
}

export interface IOrder extends Document {
  orderId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  items: IOrderItem[];
  totalPrice: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingAddressSchema = new Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  city: {
    type: String,
    required: [true, "City is required"],
  },
  province: {
    type: String,
    required: [true, "Province is required"],
  },
  postalCode: {
    type: String,
    required: [true, "Postal code is required"],
  },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    buyerId: {
      type: String,
      required: [true, "Buyer ID is required"],
      index: true,
    },
    buyerName: {
      type: String,
      required: [true, "Buyer name is required"],
    },
    buyerEmail: {
      type: String,
      required: [true, "Buyer email is required"],
    },
    sellerId: {
      type: String,
      required: [true, "Seller ID is required"],
      index: true,
    },
    items: [{ type: Schema.Types.Mixed }],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    shippingAddress: ShippingAddressSchema,
    paymentMethod: {
      type: String,
      required: true,
    },
    trackingNumber: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);

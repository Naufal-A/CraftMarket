import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ICart extends Document {
  buyerId: string;
  items: ICartItem[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema({
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
  },
});

const CartSchema = new Schema<ICart>(
  {
    buyerId: {
      type: String,
      required: [true, "Buyer ID is required"],
      unique: true,
      index: true,
    },
    items: [CartItemSchema],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total price before saving
CartSchema.pre("save", function (this: ICart) {
  this.totalPrice = this.items.reduce(
    (sum: number, item: ICartItem) => sum + item.price * item.quantity,
    0
  );
});

export default mongoose.models.Cart ||
  mongoose.model<ICart>("Cart", CartSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  _id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: {
      type: String,
      required: [true, "Product ID is required"],
      index: true,
    },
    buyerId: {
      type: String,
      required: [true, "Buyer ID is required"],
    },
    buyerName: {
      type: String,
      required: [true, "Buyer name is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Review ||
  mongoose.model<IReview>("Review", ReviewSchema);

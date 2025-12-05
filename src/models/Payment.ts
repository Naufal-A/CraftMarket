import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  transactionId: string; // Midtrans transaction ID
  orderId: string;
  buyerId: string;
  amount: number;
  currency: string;
  paymentMethod: string; // credit_card, bank_transfer, gopay, etc
  status: "pending" | "completed" | "settlement" | "failed" | "expired";
  midtransResponse?: Record<string, unknown>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    buyerId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "IDR",
    },
    paymentMethod: {
      type: String,
      enum: [
        "credit_card",
        "debit_card",
        "bank_transfer",
        "gopay",
        "ovo",
        "dana",
        "linkaja",
        "qris",
        "other",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "settlement", "failed", "expired"],
      default: "pending",
      index: true,
    },
    midtransResponse: {
      type: Schema.Types.Mixed,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);

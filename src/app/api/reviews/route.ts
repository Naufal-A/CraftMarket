import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Review from "@/models/Review";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/craftmarket";

export async function GET(req: Request) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return NextResponse.json({
      reviews,
      averageRating,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const { productId, buyerId, buyerName, rating, comment } = await req.json();

    // Validation
    if (!productId || !buyerId || !buyerName || !rating || !comment) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (comment.length < 10) {
      return NextResponse.json(
        { error: "Comment must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, buyerId });
    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    const review = new Review({
      productId,
      buyerId,
      buyerName,
      rating,
      comment,
    });

    await review.save();

    return NextResponse.json(
      { message: "Review created successfully", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

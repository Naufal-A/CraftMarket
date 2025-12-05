import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

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
        ? (reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length).toFixed(1)
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

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { productId, buyerId, buyerName, orderId, rating, comment } = await req.json();

    // Validation
    if (!productId || !buyerId || !buyerName || !orderId || !rating || !comment) {
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

    if (comment.length < 10 || comment.length > 500) {
      return NextResponse.json(
        { error: "Comment must be between 10 and 500 characters" },
        { status: 400 }
      );
    }

    // Verify that the order exists, belongs to the buyer, and is delivered
    const order = await Order.findOne({
      _id: orderId,
      buyerId,
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status !== "delivered") {
      return NextResponse.json(
        { error: "Can only review orders that are delivered" },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product for this order
    const existingReview = await Review.findOne({
      productId,
      buyerId,
      orderId,
    });
    
    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product for this order" },
        { status: 400 }
      );
    }

    const review = new Review({
      productId,
      buyerId,
      buyerName,
      orderId,
      rating,
      comment,
      verified: true,
    });

    await review.save();

    console.log(`[Review POST] Review created: ${review._id}`);

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

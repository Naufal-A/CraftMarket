import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Buyer from "@/models/Buyer";

export async function POST() {
  try {
    await dbConnect();

    // Clear orders and buyers
    const ordersResult = await Order.deleteMany({});
    const buyersResult = await Buyer.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "Data cleared successfully",
      deletedOrders: ordersResult.deletedCount,
      deletedBuyers: buyersResult.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing data:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

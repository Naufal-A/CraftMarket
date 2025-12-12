import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: "Logout berhasil" },
      { status: 200 }
    );

    // Clear token cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat logout" },
      { status: 500 }
    );
  }
}

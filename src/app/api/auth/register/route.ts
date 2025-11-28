import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { name, email, password, confirmPassword, role = 'buyer', shopName } = await request.json();

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Password tidak cocok' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      shopName: role === 'seller' ? shopName : undefined,
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json(
      {
        message: 'Pendaftaran berhasil',
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Register error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat pendaftaran';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

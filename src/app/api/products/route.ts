import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

// GET all products or filter by category
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = {};
    if (category) {
      query = { category };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        message: 'Produk berhasil diambil',
        products,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Get products error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil produk';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { name, description, price, category, sellerId, images, stock, image } = await request.json();

    // Validation
    if (!name || !description || !price || !category || !sellerId) {
      return NextResponse.json(
        { message: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { message: 'Harga tidak boleh negatif' },
        { status: 400 }
      );
    }

    // Create new product
    const productImages = images || [];
    if (image) {
      productImages.unshift(image); // Add image as first item
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      sellerId,
      images: productImages,
      stock: stock || 0,
    });

    await product.save();

    return NextResponse.json(
      {
        message: 'Produk berhasil dibuat',
        product,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Create product error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat produk';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

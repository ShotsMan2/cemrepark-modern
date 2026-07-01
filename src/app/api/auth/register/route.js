import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre zorunludur' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi ile kayıtlı bir kullanıcı zaten var' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password, // In a real app, hash this password
        role: 'USER',
      },
    });

    return NextResponse.json(
      { message: 'Kayıt başarılı', user: { id: newUser.id, email: newUser.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Kayıt olurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

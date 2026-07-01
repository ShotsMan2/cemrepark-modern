import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch banners." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, imageUrl, linkUrl, isActive, order } = body;

    const banner = await prisma.banner.create({
      data: {
        title,
        imageUrl,
        linkUrl,
        isActive: isActive ?? true,
        order: parseInt(order) || 0,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create banner." },
      { status: 500 }
    );
  }
}

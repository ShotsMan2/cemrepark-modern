import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch banner." },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const { title, imageUrl, linkUrl, isActive, order } = body;

    const banner = await prisma.banner.update({
      where: { id: parseInt(params.id) },
      data: {
        title,
        imageUrl,
        linkUrl,
        isActive,
        order: parseInt(order),
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update banner." },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.banner.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: "Banner deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete banner." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(resolvedParams.id) },
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('GET hatası:', error);
    return NextResponse.json(
      { error: "Failed to fetch banner." },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const body = await req.json();
    const { title, imageUrl, linkUrl, isActive, order } = body;

    const banner = await prisma.banner.update({
      where: { id: parseInt(resolvedParams.id) },
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
    console.error('PUT hatası:', error);
    return NextResponse.json(
      { error: "Failed to update banner." },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const bannerId = parseInt(resolvedParams.id);
    
    const existingBanner = await prisma.banner.findUnique({
      where: { id: bannerId },
    });
    
    if (!existingBanner) {
      return NextResponse.json({ error: "Banner bulunamadı." }, { status: 404 });
    }

    await prisma.banner.delete({
      where: { id: bannerId },
    });

    return NextResponse.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error('Silme hatası (detay):', error);
    return NextResponse.json(
      { error: `Failed to delete banner: ${error.message}` },
      { status: 500 }
    );
  }
}

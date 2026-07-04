import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params; // Params'ı await ediyoruz!
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
    const resolvedParams = await params; // Params'ı await ediyoruz!
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
    const resolvedParams = await params; // Params'ı await ediyoruz!
    console.log('Silme isteği alındı, params:', resolvedParams);
    const bannerId = parseInt(resolvedParams.id);
    console.log('Silinecek banner ID (sayısal):', bannerId);
    
    const existingBanner = await prisma.banner.findUnique({
      where: { id: bannerId },
    });
    
    if (!existingBanner) {
      console.log('Banner bulunamadı!');
      return NextResponse.json({ error: "Banner bulunamadı." }, { status: 404 });
    }

    await prisma.banner.delete({
      where: { id: bannerId },
    });

    console.log('Banner başarıyla silindi!');
    return NextResponse.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error('Silme hatası (detay):', error);
    return NextResponse.json(
      { error: `Failed to delete banner: ${error.message}` },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');

function readProducts() {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return [];
  }
}

function writeProducts(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const body = await request.json();
    
    let products = readProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }
    
    products[index] = { ...products[index], ...body, id }; // id değişmesin
    writeProducts(products);
    
    // Sync update/upsert to DB
    try {
      await prisma.product.upsert({
        where: { id },
        update: {
          ad: body.ad || '',
          fiyat: parseFloat(body.fiyat) || 0,
          kategori: body.kategori || '',
          resim: body.resim || '',
          gorsel: body.gorsel || '',
          etiket: body.etiket || '',
          renk: body.renk || '',
          beden: body.beden || '',
        },
        create: {
          id,
          ad: body.ad || '',
          fiyat: parseFloat(body.fiyat) || 0,
          kategori: body.kategori || '',
          resim: body.resim || '',
          gorsel: body.gorsel || '',
          etiket: body.etiket || '',
          renk: body.renk || '',
          beden: body.beden || '',
        }
      });
    } catch (dbErr) {
      console.error("DB product PUT sync error:", dbErr);
    }
    
    return NextResponse.json(products[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    let products = readProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (products.length === filteredProducts.length) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }
    
    writeProducts(filteredProducts);
    
    // Sync delete to DB (along with related reviews if any, ignoring errors if foreign constraints delete fails)
    try {
      await prisma.review.deleteMany({ where: { productId: id } });
      await prisma.product.delete({ where: { id } });
    } catch (dbErr) {
      console.error("DB product DELETE sync error:", dbErr);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Silme başarısız' }, { status: 500 });
  }
}

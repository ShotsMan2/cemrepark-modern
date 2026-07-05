import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
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

export async function GET() {
  const products = readProducts();
  return NextResponse.json(products);
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const products = readProducts();
    
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      ...body
    };
    
    products.unshift(newProduct); // En başa ekle (Trend/Yeni olarak çıksın)
    writeProducts(products);
    
    // Sync to DB
    try {
      await prisma.product.create({
        data: {
          id: newId,
          ad: newProduct.ad || '',
          fiyat: parseFloat(newProduct.fiyat) || 0,
          kategori: newProduct.kategori || '',
          resim: newProduct.resim || '',
          gorsel: newProduct.gorsel || '',
          etiket: newProduct.etiket || '',
          renk: newProduct.renk || '',
          beden: newProduct.beden || '',
        }
      });
    } catch (dbErr) {
      console.error("DB product sync error:", dbErr);
    }
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Ürün eklenemedi' }, { status: 500 });
  }
}

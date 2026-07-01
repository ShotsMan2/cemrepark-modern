import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(pages);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch pages." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, slug, content } = body;

    const page = await prisma.page.create({
      data: { title, slug, content },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create page." },
      { status: 500 }
    );
  }
}

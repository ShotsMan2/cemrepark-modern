import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const page = await prisma.page.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch page." },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const { title, slug, content } = body;

    const page = await prisma.page.update({
      where: { id: parseInt(params.id) },
      data: { title, slug, content },
    });

    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update page." },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.page.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: "Page deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete page." },
      { status: 500 }
    );
  }
}

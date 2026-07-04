import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const page = await prisma.page.findUnique({
      where: { id: parseInt(resolvedParams.id) },
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const body = await req.json();
    const { title, slug, content } = body;

    const page = await prisma.page.update({
      where: { id: parseInt(resolvedParams.id) },
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    await prisma.page.delete({
      where: { id: parseInt(resolvedParams.id) },
    });

    return NextResponse.json({ message: "Page deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete page." },
      { status: 500 }
    );
  }
}

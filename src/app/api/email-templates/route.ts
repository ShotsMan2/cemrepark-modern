import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// GET /api/email-templates — List all email templates (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const templates = await prisma.emailTemplate.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("EmailTemplate GET error:", error);
    return NextResponse.json({ error: "E-posta şablonları yüklenemedi." }, { status: 500 });
  }
}

// POST /api/email-templates — Create a new email template (Admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const { name, subject, body, variables, isActive } = await request.json();

    if (!name || !subject || !body) {
      return NextResponse.json({ error: "Ad, konu ve içerik gerekli." }, { status: 400 });
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        body,
        variables: variables ? JSON.stringify(variables) : null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("EmailTemplate POST error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Bu isimde bir şablon zaten mevcut." }, { status: 409 });
    }
    return NextResponse.json({ error: "E-posta şablonu oluşturulamadı." }, { status: 500 });
  }
}

// PUT /api/email-templates — Update an email template (Admin only)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const { id, name, subject, body, variables, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID gerekli." }, { status: 400 });
    }

    const template = await prisma.emailTemplate.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(body && { body }),
        ...(variables !== undefined && { variables: variables ? JSON.stringify(variables) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("EmailTemplate PUT error:", error);
    return NextResponse.json({ error: "E-posta şablonu güncellenemedi." }, { status: 500 });
  }
}

// DELETE /api/email-templates — Delete an email template (Admin only)
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID gerekli." }, { status: 400 });
    }

    await prisma.emailTemplate.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true, message: "E-posta şablonu silindi." });
  } catch (error) {
    console.error("EmailTemplate DELETE error:", error);
    return NextResponse.json({ error: "E-posta şablonu silinemedi." }, { status: 500 });
  }
}

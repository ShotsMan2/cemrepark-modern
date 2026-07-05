import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

// Basit Rate Limiter (Sadece MVP için In-Memory Map)
const rateLimitMap = new Map();

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    
    // Rate Limiting Mantığı (1 dakikada maksimum 5 istek)
    const now = Date.now();
    const windowMs = 60 * 1000;
    const limit = 5;
    
    if (rateLimitMap.has(ip)) {
      const data = rateLimitMap.get(ip);
      if (now - data.startTime < windowMs) {
        if (data.count >= limit) {
          return NextResponse.json({ error: "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
        }
        data.count++;
      } else {
        rateLimitMap.set(ip, { count: 1, startTime: now });
      }
    } else {
      rateLimitMap.set(ip, { count: 1, startTime: now });
    }

    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email ve şifre zorunludur." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });
    }

    // Kullanıcı var mı kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var." }, { status: 409 });
    }

    // Şifreyi Hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluştur
    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        role: "user", // Varsayılan rol "user"
      },
    });

    // Audit Log Kaydı (İsteğe bağlı, güvenlik ve izleme için)
    await prisma.auditLog.create({
      data: {
        userId: newUser.id,
        action: "USER_REGISTERED",
        details: "Kullanıcı credentials ile kayıt oldu.",
        ipAddress: ip
      }
    });

    return NextResponse.json(
      { message: "Kayıt işlemi başarılı.", user: { id: newUser.id, email: newUser.email, name: newUser.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return NextResponse.json({ error: "Kayıt sırasında bir hata oluştu." }, { status: 500 });
  }
}

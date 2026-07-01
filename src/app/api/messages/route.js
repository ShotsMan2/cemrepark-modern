import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { id: 'desc' }
    });
    
    // Map email back to ePosta for backward compatibility if needed,
    // though it's better to just return as is if the UI uses email.
    // The previous code returned ePosta. Let's keep it consistent.
    const formattedMessages = messages.map(m => ({
      ...m,
      ePosta: m.email,
    }));
    
    return NextResponse.json(formattedMessages);
  } catch (error) {
    return NextResponse.json({ error: 'Mesajlar alınamadı' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { adSoyad, ePosta, email, telefon, mesaj } = body;
    
    const userEmail = ePosta || email;

    if (!adSoyad || !userEmail || !mesaj) {
      return NextResponse.json({ error: 'Lütfen tüm alanları doldurun' }, { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        adSoyad,
        email: userEmail,
        telefon: telefon || null,
        mesaj,
        tarih: new Date().toLocaleString('tr-TR')
      }
    });
    
    // format for response
    const responseMessage = {
      ...newMessage,
      ePosta: newMessage.email,
    };
    
    return NextResponse.json(responseMessage, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Mesaj gönderilemedi' }, { status: 500 });
  }
}

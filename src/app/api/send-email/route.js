import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, subject, message } = body;
    
    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'Lütfen tüm alanları doldurun' }, { status: 400 });
    }

    // Konsola gönderilen e-posta simülasyonunu yazdıralım
    console.log("=========================================");
    console.log("E-POSTA GÖNDERİLDİ (SİMÜLASYON)");
    console.log(`Alıcı: ${to}`);
    console.log(`Konu: ${subject}`);
    console.log(`Mesaj: ${message}`);
    console.log("=========================================");

    // Simüle etmek için ufak bir bekleme ekleyelim (500ms)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return NextResponse.json({ success: true, message: 'E-posta başarıyla gönderildi (Simüle edildi).' });
  } catch (error) {
    return NextResponse.json({ error: 'E-posta gönderilemedi' }, { status: 500 });
  }
}

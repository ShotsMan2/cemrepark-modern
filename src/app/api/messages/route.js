import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'data', 'messages.json');

function readMessages() {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return [];
  }
}

function writeMessages(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  const messages = readMessages();
  return NextResponse.json(messages);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { adSoyad, ePosta, mesaj } = body;
    
    if (!adSoyad || !ePosta || !mesaj) {
      return NextResponse.json({ error: 'Lütfen tüm alanları doldurun' }, { status: 400 });
    }

    const messages = readMessages();
    
    const newId = messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1;
    const newMessage = {
      id: newId,
      adSoyad,
      ePosta,
      mesaj,
      tarih: new Date().toLocaleString('tr-TR')
    };
    
    messages.unshift(newMessage); // Add new message to the top
    writeMessages(messages);
    
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Mesaj gönderilemedi' }, { status: 500 });
  }
}

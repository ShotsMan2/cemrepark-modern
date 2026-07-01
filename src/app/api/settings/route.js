import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'data', 'settings.json');

function readSettings() {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return {
      siteAdi: "Cemre Park",
      iletisimEposta: "info@cemrepark.com",
      destekTelefonu: "0554 169 89 09",
      adres: "Moda Sokak No: 123, Tekstil Merkezi, İstanbul",
      kargoUcreti: 49.90,
      ucretsizKargoLimiti: 1500,
      ayniGunTeslimat: true,
      bakimModu: false,
      ozelCss: ""
    };
  }
}

function writeSettings(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  const settings = readSettings();
  return NextResponse.json(settings);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const currentSettings = readSettings();
    
    const updatedSettings = {
      ...currentSettings,
      ...body
    };
    
    writeSettings(updatedSettings);
    return NextResponse.json(updatedSettings);
  } catch (error) {
    return NextResponse.json({ error: 'Ayarlar güncellenemedi' }, { status: 500 });
  }
}

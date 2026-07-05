import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import fs from 'fs';
import path from 'path';

const defaultSettings = {
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

export async function GET() {
  try {
    const settingsRows = await prisma.setting.findMany();
    
    // If no settings in DB, return defaults
    if (settingsRows.length === 0) {
      return NextResponse.json(defaultSettings);
    }
    
    const settings = { ...defaultSettings };
    
    settingsRows.forEach(row => {
      // Parse boolean and number values if needed based on key
      let value = row.value;
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(Number(value)) && value.trim() !== '' && typeof defaultSettings[row.key] === 'number') {
        value = Number(value);
      }
      settings[row.key] = value;
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json(defaultSettings);
  }
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
    
    // Update or create each setting
    for (const [key, value] of Object.entries(body)) {
      const stringValue = typeof value === 'string' ? value : String(value);
      
      await prisma.setting.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue },
      });
    }
    
    // Fetch updated settings to return
    const updatedRows = await prisma.setting.findMany();
    const updatedSettings = { ...defaultSettings };
    
    updatedRows.forEach(row => {
      let value = row.value;
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(Number(value)) && value.trim() !== '' && typeof defaultSettings[row.key] === 'number') {
        value = Number(value);
      }
      updatedSettings[row.key] = value;
    });
    
    // Write to settings.json to keep it in sync with DB for static/SSR functions
    try {
      const filePath = path.join(process.cwd(), 'src', 'data', 'settings.json');
      fs.writeFileSync(filePath, JSON.stringify(updatedSettings, null, 2), 'utf8');
    } catch (fsError) {
      console.error("settings.json güncellenirken hata oluştu:", fsError);
    }
    
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ayarlar güncellenemedi' }, { status: 500 });
  }
}


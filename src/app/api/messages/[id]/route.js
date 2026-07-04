import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

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

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    let messages = readMessages();
    const filteredMessages = messages.filter(m => m.id !== id);
    
    if (messages.length === filteredMessages.length) {
      return NextResponse.json({ error: 'Mesaj bulunamadı' }, { status: 404 });
    }
    
    writeMessages(filteredMessages);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Silme başarısız' }, { status: 500 });
  }
}

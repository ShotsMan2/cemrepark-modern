import { NextResponse } from "next/server";
import { chatService } from "@/services/chatService";
import { productService } from "@/services/productService";

const CHATBOT_API_URL = process.env.CHATBOT_API_URL || "http://localhost:11434/api/chat";
const DEFAULT_MODEL = process.env.CHATBOT_DEFAULT_MODEL || "qwen2.5-coder:latest";

async function getDynamicSystemPrompt() {
  let products = [];
  try {
    products = await productService.getProducts();
  } catch (error) {
    console.error("[Chat API] Failed to fetch products for system prompt:", error);
  }

  const productList = products
    .map(
      (p) =>
        `- ${p.ad}: Kategori: ${p.kategori || "Genel"}, Fiyat: ${p.fiyat} TL, Renkler: ${p.renk || "Belirtilmemiş"}, Bedenler: ${p.beden || "Belirtilmemiş"}, Stok: ${p.stok || 0} adet, Etiket: ${p.etiket || "Yok"}`
    )
    .join("\n");

  return `Sen Cemre Park web sitesinin resmi alışveriş asistanısın. Kullanıcıya ürünler, ödeme, teslimat ve iade konularında nazik ve doğru bilgiler ver.
Müşterinin sorduğu ürünlerin renklerini, bedenlerini ve fiyatlarını aşağıdaki güncel ürün listesinden kontrol ederek cevapla.
Eğer bilgi ürün listesinde yoksa "Bu bilgiye şu an sistemimden ulaşamıyorum" şeklinde dürüstçe belirt. Asla listede olmayan bir ürünü veya listede olmayan bir özelliği uydurma.

Mağazadaki güncel ürün listesi ve özellikleri:
${productList}`;
}

async function fetchAiResponse(model, messages) {
  const response = await fetch(CHATBOT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, stream: false }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`AI servisi başarısız oldu: ${response.status} ${payload}`);
  }

  const data = await response.json();
  return (
    data?.message?.content || data?.content || data?.choices?.[0]?.message?.content ||
    "Asistan yanıt üretemedi. Lütfen daha sonra tekrar deneyin."
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, sessionId, model, context } = body || {};

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mesaj alanı zorunludur." }, { status: 400 });
    }

    const selectedModel = (model || DEFAULT_MODEL).trim();
    let conversation = null;
    let conversationId = sessionId;

    const dynamicSystemPrompt = await getDynamicSystemPrompt();

    if (sessionId) {
      conversation = await chatService.getConversation(sessionId);
      if (!conversation) {
        conversationId = undefined;
      }
    }

    if (!conversation) {
      conversationId = crypto.randomUUID();
      conversation = await chatService.createConversation({
        id: conversationId,
        title: message.slice(0, 120),
        model: selectedModel,
        systemPrompt: dynamicSystemPrompt,
      });
    }

    const history = await chatService.getMessages(conversationId);
    const promptMessages = [
      { role: "system", content: dynamicSystemPrompt },
    ];

    if (context && typeof context === "string" && context.trim().length > 0) {
      promptMessages.push({
        role: "system",
        content: `Aşağıdaki ek bilgileri kullanarak yanıt ver:\n${context}`,
      });
    }

    history.slice(-8).forEach((entry) => {
      promptMessages.push({ role: entry.role, content: entry.content });
    });

    promptMessages.push({ role: "user", content: message });

    await chatService.createMessage(conversationId, "user", message, "completed");

    let assistantContent = "Asistan şu anda yanıt veremiyor.";
    let assistantStatus = "completed";

    try {
      assistantContent = await fetchAiResponse(selectedModel, promptMessages);
    } catch (error) {
      assistantStatus = "failed";
      console.error("[Chat Widget] AI isteği başarısız oldu:", error);
    }

    await chatService.createMessage(conversationId, "assistant", assistantContent, assistantStatus);

    return NextResponse.json({ sessionId: conversationId, content: assistantContent });
  } catch (error) {
    console.error("[Chat Widget] POST hata:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}


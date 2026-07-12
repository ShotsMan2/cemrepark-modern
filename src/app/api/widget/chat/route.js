import { NextResponse } from "next/server";
import { chatService } from "@/services/chatService";
import { productService } from "@/services/productService";
import prisma from "@/lib/prisma";

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

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": "*", // Herhangi bir siteden gelen isteklere izin ver veya kendi domaininizi yazın
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Expose-Headers": "X-Session-Id",
  };
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, sessionId, model, context, cartItems, user } = body || {};

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mesaj alanı zorunludur." }, { 
        status: 400,
        headers: corsHeaders(request.headers.get("origin"))
      });
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

    if (user && user.name) {
      promptMessages.push({
        role: "system",
        content: `Müşteri sisteme giriş yapmış durumda. Adı: ${user.name}. Lütfen ona ismiyle (veya uygun şekilde) hitap et ve sıcak bir deneyim sun.`
      });
    }

    if (cartItems && cartItems.length > 0) {
      const cartDesc = cartItems.map(item => `${item.quantity} adet ${item.ad} (Beden: ${item.beden || "Belirtilmemiş"}, Renk: ${item.renk || "Belirtilmemiş"})`).join(", ");
      promptMessages.push({
        role: "system",
        content: `Müşterinin sepetinde anlık olarak şu ürün(ler) var: ${cartDesc}. Gerekirse "Sepetinizdeki bu şalı tamamlayacak..." veya "Sepetinizde harika parçalar var" şeklinde satış artırıcı (cross-sell) ve bağlama uygun proaktif yönlendirmelerde bulun.`
      });
    }

    // Add order history context for logged-in users
    if (user && user.id) {
      try {
        const { orderService } = await import('@/services/orderService');
        const orders = await prisma.order.findMany({
          where: { userId: parseInt(user.id) },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { items: { include: { product: true } } }
        });
        
        if (orders.length > 0) {
          const orderSummary = orders.map(o => {
            const itemList = o.items.map(i => `${i.quantity}x ${i.product?.ad || 'Ürün'}`).join(', ');
            return `Sipariş #${o.id} (${o.createdAt.toLocaleDateString('tr-TR')}): ${itemList} - Toplam: ${o.total} TL - Durum: ${o.status}`;
          }).join('\n');
          
          promptMessages.push({
            role: 'system',
            content: `Müşterinin son sipariş geçmişi:\n${orderSummary}\nMüşteri sipariş durumunu sorarsa bu bilgileri kullanarak yanıtla.`
          });
        }
      } catch (err) {
        console.error('[Chat API] Order history fetch failed:', err);
      }
    }

    // Add product recommendations context
    if (user && user.id) {
      try {
        const { recommendationService } = await import('@/services/recommendationService');
        const recommendations = await recommendationService.getRecommendationsForUser(parseInt(user.id), 4);
        if (recommendations.length > 0) {
          const recList = recommendations.map(p => `${p.ad} (${p.fiyat} TL, Kategori: ${p.kategori || 'Genel'})`).join(', ');
          promptMessages.push({
            role: 'system',
            content: `Bu müşteriye önerebileceğin ürünler: ${recList}. Müşteri ürün önerisi isterse bu listeyi kullan.`
          });
        }
      } catch (err) {
        console.error('[Chat API] Recommendation fetch failed:', err);
      }
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

    return NextResponse.json(
      { sessionId: conversationId, content: assistantContent },
      { headers: corsHeaders(request.headers.get("origin")) }
    );
  } catch (error) {
    console.error("[Chat Widget] POST hata:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { 
      status: 500,
      headers: corsHeaders(request.headers?.get?.("origin") || "*")
    });
  }
}


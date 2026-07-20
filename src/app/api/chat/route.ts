import { logger } from "@/lib/logger";
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Product } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Geçersiz mesaj formatı" }, { status: 400 });
    }

    // Simulate AI thinking delay for a more natural feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    const lastMessage = messages[messages.length - 1].content.toLowerCase() as string;

    // Default response structure
    let responseObj: {
      reply: string;
      products: Product[];
      quickReplies: string[];
    } = {
      reply:
        "Size yardımcı olmaktan memnuniyet duyarım. Özel bir ürün arayışınız mı var, yoksa siparişiniz hakkında mı bilgi almak istersiniz? ✨",
      products: [],
      quickReplies: ["Yeni Gelenler", "İndirimdekiler", "Sipariş Takibi", "Bize Ulaşın"],
    };

    // INTENT DETECTION & DB QUERIES
    if (lastMessage.includes("merhaba") || lastMessage.includes("selam")) {
      responseObj.reply =
        "Merhaba! Cemre Park'a hoş geldiniz. 🌸\nSizi yansıtan en güzel kombinleri bulmanız için buradayım. Bugün nasıl yardımcı olabilirim?";
    } else if (lastMessage.includes("kargo") || lastMessage.includes("teslimat")) {
      responseObj.reply =
        "Siparişleriniz standart olarak 1-3 iş günü içerisinde kargoya teslim edilmektedir. 📦\n\n📌 1000 TL ve üzeri tüm alışverişlerinizde kargo tamamen ücretsizdir! Siparişinizin durumunu öğrenmek isterseniz sipariş numaranızı yazabilirsiniz.";
      responseObj.quickReplies = ["Sipariş Takibi", "İade Şartları"];
    } else if (
      lastMessage.includes("iade") ||
      lastMessage.includes("değişim") ||
      lastMessage.includes("şart")
    ) {
      responseObj.reply =
        "Sizin memnuniyetiniz bizim için önemli! 💖\nÜrünlerinizi teslim aldıktan sonra 14 gün içerisinde faturasıyla birlikte iade veya değişim yapabilirsiniz. Detaylar için 'İade Koşulları' sayfamızı inceleyebilirsiniz.";
      responseObj.quickReplies = ["Bize Ulaşın", "Sipariş Takibi"];
    } else if (
      lastMessage.includes("indirim") ||
      lastMessage.includes("kampanya") ||
      lastMessage.includes("fırsat")
    ) {
      const discountedProducts = await prisma.product.findMany({
        where: {
          OR: [{ etiket: { contains: "indirim" } }, { ad: { contains: "indirim" } }],
        },
        take: 3,
        orderBy: { createdAt: "desc" },
      });
      if (discountedProducts.length > 0) {
        responseObj.reply =
          "Sizin için harika fırsatlarımız var! 🎉 Şu an indirimde olan en popüler ürünlerimizden bazıları şunlar:";
        responseObj.products = discountedProducts as Product[];
      } else {
        responseObj.reply =
          "Şu an için aktif bir indirim kampanyamız bulunmuyor, ancak yeni sezon ürünlerimizi mutlaka incelemelisiniz! 👗";
      }
      responseObj.quickReplies = ["Yeni Gelenler", "Tüm Ürünler"];
    } else if (
      lastMessage.includes("elbise") ||
      lastMessage.includes("tunik") ||
      lastMessage.includes("pantolon") ||
      lastMessage.includes("öneri")
    ) {
      // Kelime bazlı kategori araması
      const keyword = lastMessage.includes("elbise")
        ? "elbise"
        : lastMessage.includes("tunik")
          ? "tunik"
          : lastMessage.includes("pantolon")
            ? "pantolon"
            : "";

      const suggestedProducts = await prisma.product.findMany({
        where: keyword
          ? {
              OR: [{ ad: { contains: keyword } }, { kategori: { contains: keyword } }],
            }
          : undefined,
        take: 3,
        orderBy: { stok: "desc" },
      });

      if (suggestedProducts.length > 0) {
        responseObj.reply =
          "Harika bir seçim! Sizin için hazırladığım şu modellere göz atmak ister misiniz? 🌟";
        responseObj.products = suggestedProducts as Product[];
      } else {
        responseObj.reply =
          "Maalesef şu an bu kriterlere uygun ürün bulamadım. Ancak diğer harika koleksiyonlarımıza göz atabilirsiniz! 💫";
      }
      responseObj.quickReplies = ["İndirimdekiler", "Tüm Kategoriler"];
    } else if (lastMessage.includes("sipariş") || lastMessage.match(/\b#?\d{1,}\b/)) {
      const orderMatch = lastMessage.match(/\b\d{1,}\b/);
      // We assume order ID is a number.
      if (orderMatch) {
        const orderId = parseInt(orderMatch[0]);
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (order) {
          responseObj.reply = `**#${order.id}** numaralı siparişinizin durumu: **${order.status}**.\n\nToplam Tutar: **${order.total} TL**. Siparişinizle ilgili sormak istediğiniz başka bir şey var mı?`;
        } else {
          responseObj.reply =
            "Maalesef belirttiğiniz numaraya ait bir sipariş bulamadım. Lütfen sipariş numaranızı kontrol edip tekrar deneyin. 🔍";
        }
      } else {
        responseObj.reply =
          "Siparişinizin durumunu öğrenmek için lütfen sipariş numaranızı (Örn: 1024) yazar mısınız? 📦";
      }
      responseObj.quickReplies = ["Kargo Takibi", "Müşteri Hizmetleri"];
    } else if (lastMessage.includes("yeni")) {
      const newProducts = await prisma.product.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
      });
      responseObj.reply =
        "İşte en yeni ürünlerimiz! Tarzınızı yenilemek için mükemmel parçalar: ✨";
      responseObj.products = newProducts as Product[];
      responseObj.quickReplies = ["İndirimdekiler", "Öneriler"];
    }

    return NextResponse.json(responseObj);
  } catch (error) {
    logger.error("Chat API Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

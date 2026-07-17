import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Geçersiz mesaj formatı" },
        { status: 400 }
      );
    }

    // In a real scenario, you would connect to OpenAI/Gemini here.
    // For now, we provide a simulated intelligent response.
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    let reply = "Size yardımcı olmaktan memnuniyet duyarım. Başka bir sorunuz var mı?";

    if (lastMessage.includes("elbise") || lastMessage.includes("tunik")) {
      reply = "Harika bir seçim! Yeni sezon elbiselerimiz ve tuniklerimiz 'Koleksiyonlar' bölümünde sizi bekliyor. İndirimli ürünlerimizi de incelemeyi unutmayın! ✨";
    } else if (lastMessage.includes("kargo") || lastMessage.includes("teslimat")) {
      reply = "Siparişleriniz genellikle 1-3 iş günü içerisinde kargoya teslim edilmektedir. 1000 TL üzeri alışverişlerinizde kargo ücretsizdir! 📦";
    } else if (lastMessage.includes("iade") || lastMessage.includes("değişim")) {
      reply = "Ürünlerimizi teslim aldıktan sonra 14 gün içerisinde iade veya değişim yapabilirsiniz. Detaylı bilgi için İade Koşulları sayfamızı ziyaret edebilirsiniz.";
    } else if (lastMessage.includes("merhaba") || lastMessage.includes("selam")) {
      reply = "Merhaba! Size en uygun kombini bulmanız için buradayım. Hangi tarz ürünler arıyorsunuz?";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

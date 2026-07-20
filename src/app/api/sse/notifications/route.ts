export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = () => {
        const data = JSON.stringify({
          message: "Dashboard güncellendi",
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };
      sendEvent();
      const interval = setInterval(() => {
        const events = [
          "Yeni sipariş alındı",
          "Stok güncellendi",
          "Yeni üye kaydı",
          "Ödeme onaylandı",
        ];
        const data = JSON.stringify({
          message: events[Math.floor(Math.random() * events.length)] + " #" + Math.floor(Math.random() * 10000),
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }, 30000);
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

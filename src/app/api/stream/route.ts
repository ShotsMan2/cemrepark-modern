import { NextResponse } from "next/server";
import eventBus, { EVENTS } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  let listener: (data: any) => void;

  const stream = new ReadableStream({
    start(controller) {
      listener = (data: any) => {
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      // Subscribe to all order status changes
      eventBus.on(EVENTS.ORDER_STATUS_CHANGED, listener);
    },
    cancel() {
      if (listener) {
        eventBus.off(EVENTS.ORDER_STATUS_CHANGED, listener);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

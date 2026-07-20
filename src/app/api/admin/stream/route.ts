import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { errorResponse } = await checkAdminAndLog(
    request,
    "STREAM_CONNECT",
    "SSE bağlantısı kuruldu"
  );
  if (errorResponse) return errorResponse;

  let intervalId: NodeJS.Timeout;

  const stream = new ReadableStream({
    start(controller) {
      // Enqueue helper
      const sendEvent = (data: any) => {
        try {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        } catch (err) {
          logger.error("SSE Stream error:", err);
        }
      };

      // Send initial connection success message
      sendEvent({ type: "connected", message: "SSE connection established." });

      // Keep connection alive with a heartbeat every 30 seconds
      intervalId = setInterval(() => {
        try {
          controller.enqueue(`: ping\n\n`);
        } catch (err) {
          logger.error("SSE Stream ping error:", err);
          clearInterval(intervalId);
        }
      }, 30000);

      // Listen for client disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
      });
    },
    cancel() {
      clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

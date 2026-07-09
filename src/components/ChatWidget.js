"use client";

import { useEffect, useRef, useState } from "react";
import ChatWidgetMessage from "./ChatWidgetMessage";

const DEFAULT_WIDGET_COLOR = "#ff007f";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const bottomRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const submitMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setErrorMessage("");
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    const assistantMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Yazıyor...",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/widget/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, sessionId }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "API isteği başarısız oldu.");
      }

      const payload = await response.json();
      const assistantText = payload?.content || "Asistan yanıt veremedi.";
      if (payload?.sessionId) {
        setSessionId(payload.sessionId);
      }

      setMessages((prev) =>
        prev.map((message) =>
          message.role === "assistant" && message.content === "Yazıyor..."
            ? { ...message, content: assistantText }
            : message
        )
      );
    } catch (error) {
      if (error.name === "AbortError") {
        setMessages((prev) =>
          prev.map((message) =>
            message.role === "assistant" && message.content === "Yazıyor..."
              ? { ...message, content: "Yanıt durduruldu." }
              : message
          )
        );
        return;
      }
      const messageText = error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.";
      setErrorMessage(messageText);
      setMessages((prev) =>
        prev.map((message) =>
          message.role === "assistant" && message.content === "Yazıyor..."
            ? { ...message, content: "Sistem yoğun. Lütfen daha sonra tekrar deneyin." }
            : message
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  };

  return (
    <div className="chat-widget-container">
      {isOpen ? (
        <div className="chat-widget-panel">
          <div className="chat-widget-header" style={{ background: DEFAULT_WIDGET_COLOR }}>
            <div>
              <h3>Alışveriş Asistanı</h3>
              <p>Size en hızlı şekilde yardımcı olabilirim.</p>
            </div>
            <button className="chat-widget-close" onClick={() => setIsOpen(false)} aria-label="Kapat">
              ×
            </button>
          </div>

          <div className="chat-widget-body">
            {messages.length === 0 && (
              <div className="chat-widget-welcome">
                <strong>Merhaba!</strong>
                <p>Herhangi bir ürün, sipariş ya da teslimat sorusu sorabilirsiniz.</p>
              </div>
            )}

            {messages.map((message) => (
              <ChatWidgetMessage key={message.id} message={message} />
            ))}

            <div ref={bottomRef} />
          </div>

          <div className="chat-widget-footer">
            {errorMessage && <div className="chat-widget-error">{errorMessage}</div>}
            <textarea
              className="chat-widget-input"
              placeholder="Sorunuzu buraya yazın..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading}
            />
            {isLoading ? (
              <button 
                className="chat-widget-send" 
                onClick={() => abortControllerRef.current?.abort()}
                style={{ backgroundColor: "#ff4444", color: "white" }}
              >
                Durdur
              </button>
            ) : (
              <button className="chat-widget-send" onClick={submitMessage} disabled={!input.trim()}>
                Gönder
              </button>
            )}
          </div>
        </div>
      ) : (
        <button className="chat-widget-launcher" style={{ background: DEFAULT_WIDGET_COLOR }} onClick={() => setIsOpen(true)}>
          Sohbet Asistanı
        </button>
      )}
    </div>
  );
}

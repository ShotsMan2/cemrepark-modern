"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ChatWidgetMessage from "./ChatWidgetMessage";
import ChatWidgetQuickActions from "./ChatWidgetQuickActions";
import { useSession } from "next-auth/react";
import { useStore } from "../context/StoreContext";

const DEFAULT_WIDGET_COLOR = "#ff007f";

export default function ChatWidget() {
  const sessionData = useSession() || {};
  const session = sessionData.data;
  const storeData = useStore() || {};
  const cartItems = storeData.cartItems || [];
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const bottomRef = useRef(null);
  const abortControllerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsClosing(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 250);
  };

  const handleClearChat = () => {
    setMessages([]);
    setSessionId(null);
    setErrorMessage("");
  };

  const submitMessage = useCallback(async (overrideMessage) => {
    const trimmed = (overrideMessage || input).trim();
    if (!trimmed || isLoading) return;

    setErrorMessage("");
    const now = new Date().toISOString();
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: now,
    };
    const assistantMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Yazıyor...",
      timestamp: null,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    if (!overrideMessage) setInput("");
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/widget/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, sessionId, cartItems, user: session?.user }),
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

      const responseTime = new Date().toISOString();
      setMessages((prev) =>
        prev.map((message) =>
          message.role === "assistant" && message.content === "Yazıyor..."
            ? { ...message, content: assistantText, timestamp: responseTime }
            : message
        )
      );

      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setMessages((prev) =>
          prev.map((message) =>
            message.role === "assistant" && message.content === "Yazıyor..."
              ? { ...message, content: "Yanıt durduruldu.", timestamp: new Date().toISOString() }
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
            ? { ...message, content: "Bir hata oluştu. Lütfen tekrar deneyin.", timestamp: new Date().toISOString() }
            : message
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sessionId, cartItems, session, isOpen]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  };

  const handleQuickAction = (message) => {
    submitMessage(message);
  };

  return (
    <div className="chat-widget-container">
      {isOpen ? (
        <div className={`chat-widget-panel ${isClosing ? 'chat-widget-panel-closing' : 'chat-widget-panel-open'}`}>
          {/* Header */}
          <div className="chat-widget-header" style={{ background: `linear-gradient(135deg, ${DEFAULT_WIDGET_COLOR}, #cc0066)` }}>
            <div className="chat-widget-header-info">
              <div className="chat-widget-header-status">
                <span className="chat-widget-status-dot"></span>
                <span className="chat-widget-status-text">Çevrimiçi</span>
              </div>
              <h3>Alışveriş Asistanı</h3>
              <p>Size en hızlı şekilde yardımcı olabilirim.</p>
            </div>
            <div className="chat-widget-header-actions">
              {messages.length > 0 && (
                <button
                  className="chat-widget-header-btn"
                  onClick={handleClearChat}
                  aria-label="Sohbeti temizle"
                  title="Sohbeti temizle"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  </svg>
                </button>
              )}
              <button className="chat-widget-close" onClick={handleClose} aria-label="Kapat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="chat-widget-body">
            {messages.length === 0 && (
              <div className="chat-widget-welcome">
                <div className="chat-widget-welcome-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <strong>Merhaba {session?.user?.name || ""}! 👋</strong>
                <p>Herhangi bir ürün, sipariş ya da teslimat sorusu sorabilirsiniz.</p>
                <ChatWidgetQuickActions onAction={handleQuickAction} />
              </div>
            )}

            {messages.map((message) => (
              <ChatWidgetMessage key={message.id} message={message} />
            ))}

            <div ref={bottomRef} />
          </div>

          {/* Footer */}
          <div className="chat-widget-footer">
            {errorMessage && <div className="chat-widget-error">{errorMessage}</div>}
            <div className="chat-widget-input-row">
              <textarea
                ref={inputRef}
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
                  className="chat-widget-send chat-widget-send-stop"
                  onClick={() => abortControllerRef.current?.abort()}
                  aria-label="Durdur"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                  </svg>
                </button>
              ) : (
                <button
                  className="chat-widget-send"
                  onClick={() => submitMessage()}
                  disabled={!input.trim()}
                  aria-label="Gönder"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          className="chat-widget-launcher chat-widget-launcher-pulse"
          style={{ background: `linear-gradient(135deg, ${DEFAULT_WIDGET_COLOR}, #cc0066)` }}
          onClick={handleOpen}
          aria-label="Sohbet Asistanını Aç"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          {unreadCount > 0 && (
            <span className="chat-widget-badge">{unreadCount}</span>
          )}
        </button>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ChatWidgetMessage from "./ChatWidgetMessage";
import ChatWidgetQuickActions from "./ChatWidgetQuickActions";
import { useSession } from "next-auth/react";
import { useStore } from "../context/StoreContext";

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
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      {isOpen ? (
        <div 
          className={`pointer-events-auto mb-4 w-[360px] sm:w-[420px] h-[550px] max-h-[85vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 origin-bottom-right
          ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100 animate-fade-in-up'}
          bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/20 dark:border-zinc-700/50
          `}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm relative z-10">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
                </span>
                <span className="text-[0.65rem] uppercase tracking-wider font-bold text-white/90">Çevrimiçi</span>
              </div>
              <h3 className="font-bold text-[1.15rem] leading-tight text-white shadow-sm">Alışveriş Asistanı</h3>
              <p className="text-xs text-white/80 mt-0.5">Size en hızlı şekilde yardımcı olabilirim.</p>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  className="p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                  onClick={handleClearChat}
                  aria-label="Sohbeti temizle"
                  title="Sohbeti temizle"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  </svg>
                </button>
              )}
              <button 
                className="p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50" 
                onClick={handleClose} 
                aria-label="Kapat"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col scroll-smooth">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in-up">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-full flex items-center justify-center mb-4 text-pink-600 dark:text-pink-400 shadow-sm border border-pink-200/50 dark:border-pink-800/50">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <strong className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Merhaba {session?.user?.name ? session.user.name.split(' ')[0] : ""}! 👋</strong>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-[250px]">Herhangi bir ürün, sipariş ya da teslimat sorusu sorabilirsiniz.</p>
                <ChatWidgetQuickActions onAction={handleQuickAction} />
              </div>
            )}

            <div className="flex flex-col pb-2">
              {messages.map((message) => (
                <ChatWidgetMessage key={message.id} message={message} />
              ))}
              <div ref={bottomRef} className="h-1" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-3 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border-t border-zinc-100 dark:border-zinc-800/50">
            {errorMessage && (
              <div className="mb-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-2 rounded-md border border-red-100 dark:border-red-900/30 text-center animate-fade-in-up">
                {errorMessage}
              </div>
            )}
            <div className="flex items-end gap-2 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm focus-within:ring-2 focus-within:ring-pink-500/30 focus-within:border-pink-300 dark:focus-within:border-pink-600 transition-all p-1.5">
              <textarea
                ref={inputRef}
                className="flex-1 max-h-[120px] min-h-[40px] bg-transparent text-sm text-zinc-800 dark:text-zinc-200 resize-none outline-none py-2 px-3 custom-scrollbar placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder="Sorunuzu buraya yazın..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isLoading}
              />
              {isLoading ? (
                <button
                  className="p-2.5 h-[40px] w-[40px] flex-shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors flex items-center justify-center focus:outline-none"
                  onClick={() => abortControllerRef.current?.abort()}
                  aria-label="Durdur"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                  </svg>
                </button>
              ) : (
                <button
                  className="p-2.5 h-[40px] w-[40px] flex-shrink-0 rounded-xl bg-pink-600 text-white hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none"
                  onClick={() => submitMessage()}
                  disabled={!input.trim()}
                  aria-label="Gönder"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-ml-0.5">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              )}
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-zinc-400 font-medium">✨ AI destekli asistan</span>
            </div>
          </div>
        </div>
      ) : (
        <button
          className="pointer-events-auto relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-[0_8px_30px_rgb(204,0,102,0.3)] hover:shadow-[0_8px_30px_rgb(204,0,102,0.5)] transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-pink-500/30"
          onClick={handleOpen}
          aria-label="Sohbet Asistanını Aç"
        >
          {/* Subtle pulse ring behind the button */}
          <div className="absolute inset-0 rounded-full border border-pink-400 opacity-50 animate-ping group-hover:hidden"></div>
          
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-[11px] font-bold rounded-full border-2 border-white dark:border-zinc-900 shadow-sm animate-bounce">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}

"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function AIChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "bot" | "user"; content: string; products?: any[]; quickReplies?: string[] }[]
  >([
    {
      role: "bot",
      content: "Merhaba! Cemre Park'a hoş geldiniz. Size nasıl yardımcı olabilirim?",
      quickReplies: ["İndirimli Ürünler", "Kargo Süresi", "İade Şartları"],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Hide on admin pages
  if (pathname?.startsWith("/admin")) return null;

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = { role: "user" as const, content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: data.reply,
          products: data.products,
          quickReplies: data.quickReplies,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Üzgünüm, şu an bağlantı kuramıyorum. Lütfen daha sonra tekrar deneyin.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[360px] h-[550px] max-h-[80vh] flex flex-col bg-white dark:bg-[#111] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden transform origin-bottom-right transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-neon-pink to-holo-gold p-4 flex justify-between items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h3 className="text-white font-bold tracking-wider">Cemre AI</h3>
                <p className="text-white/80 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Çevrimiçi
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full relative z-10"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-black/20 custom-scrollbar">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-gray-900 text-white dark:bg-white dark:text-black rounded-tr-sm shadow-md"
                      : "bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-tl-sm shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>

                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2 w-[85%] overflow-x-auto flex gap-2 pb-2 hide-scrollbar">
                    {msg.products.map((p) => (
                      <a
                        key={p.id}
                        href={`/urundetay/${p.id}`}
                        className="min-w-[120px] bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden group hover:border-neon-pink transition-colors"
                      >
                        <div className="h-[120px] bg-gray-200 relative overflow-hidden">
                          <Image
                            fill
                            src={p.gorsel?.split(",")[0] || p.resim || "/placeholder.jpg"}
                            alt={p.ad || "Product Image"}
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-[10px] truncate text-gray-800 dark:text-white font-medium">
                            {p.ad}
                          </p>
                          <p className="text-neon-pink font-bold text-xs mt-1">{p.fiyat} TL</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {msg.quickReplies && (
                  <div className="flex flex-wrap gap-2 mt-2 max-w-[90%]">
                    {msg.quickReplies.map((qr) => (
                      <button
                        key={qr}
                        onClick={() => sendMessage(qr)}
                        className="text-[11px] bg-neon-pink/10 hover:bg-neon-pink text-neon-pink hover:text-white dark:text-neon-pink px-3 py-1.5 rounded-full transition-colors border border-neon-pink/20"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-pink rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-holo-gold rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-[#111] border-t border-gray-100 dark:border-white/5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="relative"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Bir mesaj yazın..."
                className="w-full bg-gray-100 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-neon-pink dark:text-white placeholder-gray-500 transition-colors shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-neon-pink text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform shadow-md"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[9px] text-gray-400 dark:text-gray-600 font-medium">
                ⚡ Cemre Park AI tarafından güçlendirilmiştir
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-black dark:bg-white text-white dark:text-black hover:bg-neon-pink dark:hover:bg-neon-pink p-4 sm:p-5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_10px_40px_rgba(255,0,127,0.4)] transition-all duration-500 hover:scale-110 flex items-center justify-center z-50 overflow-hidden"
          aria-label="Open Chat"
        >
          <div className="absolute inset-0 bg-white/20 dark:bg-black/10 rounded-full blur animate-pulse group-hover:hidden"></div>
          {/* Subtle sweep effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-sweep"></div>

          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="relative z-10 group-hover:text-white"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <path d="M12 8v4"></path>
            <path d="M12 16h.01"></path>
          </svg>

          {/* Notification Dot */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-neon-pink border-2 border-black dark:border-white rounded-full animate-bounce"></span>
        </button>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Merhaba! Cemre Park'a hoş geldiniz. Size nasıl yardımcı olabilirim? 🌸" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const messagesEndRef = useRef(null);

  // Hide on admin panel
  if (pathname?.startsWith("/admin")) return null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!res.ok) throw new Error("API Error");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Üzgünüm, şu an bağlantı kuramıyorum. Lütfen WhatsApp destek hattımızı kullanın." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden clip-angled flex flex-col mb-4 animate-fade-in origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-neon-pink to-[#ff00aa] p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <div>
                <h3 className="font-bold tracking-widest text-sm uppercase">Cemre Park Asistan</h3>
                <p className="text-[10px] opacity-80">Size çok yakışacak öneriler için buradayım</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-black transition-colors" aria-label="Close Chat">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-gray-100 dark:bg-white/10 text-black dark:text-white rounded-br-none"
                      : "bg-neon-pink/10 dark:bg-neon-pink/20 text-gray-900 dark:text-gray-100 rounded-bl-none border border-neon-pink/20"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neon-pink/10 dark:bg-neon-pink/20 p-3 rounded-2xl rounded-bl-none flex gap-1">
                  <div className="w-2 h-2 bg-neon-pink rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-neon-pink rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-neon-pink rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="flex-1 bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-neon-pink text-black dark:text-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-neon-pink hover:bg-[#ff00aa] text-white p-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-neon-pink hover:bg-black text-white p-4 rounded-full shadow-[0_0_20px_rgba(255,0,127,0.4)] transition-all duration-300 hover:scale-110"
          aria-label="Open Chat"
        >
          <div className="absolute inset-0 bg-white/20 rounded-full blur animate-pulse group-hover:hidden"></div>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}
    </div>
  );
}

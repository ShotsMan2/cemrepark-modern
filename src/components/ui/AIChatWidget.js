"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "Merhaba! Cemre Park'a hoş geldiniz. Size nasıl yardımcı olabilirim? 🌸",
      quickReplies: ["Yeni Gelenler", "İndirimdekiler", "Siparişim Nerede?", "İade Şartları"]
    },
  ]);
  const [input, setInput] = useState("");
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
  }, [messages, isTyping, isOpen]);

  const handleSend = async (text) => {
    if (!text.trim() || isTyping) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!res.ok) throw new Error("API Error");

      const data = await res.json();
      setMessages((prev) => [
        ...prev, 
        { 
          role: "assistant", 
          content: data.reply,
          products: data.products || [],
          quickReplies: data.quickReplies || []
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Üzgünüm, şu an bağlantı kuramıyorum. Lütfen iletişim sayfamızı kullanın." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  // Markdown-like bold formatting for order details
  const formatText = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-neon-pink font-semibold">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
        <br />
      </span>
    ));
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[calc(100vw-32px)] sm:w-[400px] bg-white/80 dark:bg-[#111]/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden flex flex-col transition-all transform origin-bottom-right animate-fade-in-up h-[550px] max-h-[80vh]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-neon-pink/90 to-pink-500/90 backdrop-blur-md p-5 flex justify-between items-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner">
                  <span className="text-2xl animate-pulse">✨</span>
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-pink-500 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold tracking-wide text-lg">Cemre Asistan</h3>
                <p className="text-xs text-white/90 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse"></span>
                  Çevrimiçi
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="relative z-10 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all duration-300 transform hover:rotate-90" 
              aria-label="Close Chat"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 custom-scrollbar bg-gray-50/30 dark:bg-black/20">
            <div className="text-center text-xs text-gray-400 dark:text-gray-500 my-2">Bugün</div>
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className="flex items-end gap-2 max-w-[90%]">
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-neon-pink to-pink-400 flex-shrink-0 flex items-center justify-center shadow-md">
                      <span className="text-[10px] text-white">✨</span>
                    </div>
                  )}
                  <div
                    className={`p-3.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-black dark:bg-white text-white dark:text-black rounded-br-sm"
                        : "bg-white dark:bg-[#222] text-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-100 dark:border-white/5"
                    }`}
                  >
                    {formatText(msg.content)}
                  </div>
                </div>

                {/* Render Products if any */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 pl-8 flex flex-col gap-2 w-full pr-4">
                    {msg.products.map((product) => (
                      <div key={product.id} className="bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/10 flex items-center p-2 gap-3 hover:shadow-md transition-shadow group">
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                          {product.resim || product.gorsel ? (
                            <Image src={product.resim || product.gorsel} alt={product.ad} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Resim Yok</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">{product.ad}</h4>
                          <p className="text-neon-pink font-bold text-sm mt-0.5">{product.fiyat} ₺</p>
                        </div>
                        <Link href={`/urun/${product.id}`} className="bg-gray-100 dark:bg-white/10 hover:bg-neon-pink hover:text-white dark:hover:bg-neon-pink text-gray-700 dark:text-gray-300 text-[10px] px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap">
                          İncele
                        </Link>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Replies for Assistant */}
                {msg.role === "assistant" && msg.quickReplies && msg.quickReplies.length > 0 && i === messages.length - 1 && (
                  <div className="mt-3 pl-8 flex flex-wrap gap-2">
                    {msg.quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(reply)}
                        disabled={isTyping}
                        className="bg-neon-pink/10 hover:bg-neon-pink/20 dark:bg-neon-pink/15 dark:hover:bg-neon-pink/25 text-neon-pink border border-neon-pink/20 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-neon-pink to-pink-400 flex-shrink-0 flex items-center justify-center shadow-md">
                  <span className="text-[10px] text-white">✨</span>
                </div>
                <div className="bg-white dark:bg-[#222] p-4 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-white/5 shadow-sm flex gap-1.5 items-center h-[42px]">
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-[#111] border-t border-gray-100 dark:border-white/5">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Bir mesaj yazın..."
                className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-full pl-5 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-neon-pink/30 text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-1.5 p-2 bg-black dark:bg-white text-white dark:text-black hover:bg-neon-pink dark:hover:bg-neon-pink hover:text-white dark:hover:text-white rounded-full transition-all duration-300 disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed group"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[9px] text-gray-400 dark:text-gray-600 font-medium">✨ Cemre Park AI tarafından güçlendirilmiştir</span>
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
          
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 group-hover:text-white">
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

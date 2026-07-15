"use client";

import { useMemo } from "react";

function parseMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-pink-700 dark:text-pink-300">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-zinc-800 dark:text-zinc-200">$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md font-mono text-sm text-pink-600 dark:text-pink-400">$1</code>')
    .replace(/^[\-\•]\s+(.+)$/gm, '<li class="ml-4 mb-1 list-disc">$1</li>')
    .replace(/\n/g, '<br/>');
  
  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/((?:<li class="ml-4 mb-1 list-disc">.*?<\/li>(?:<br\/>)?)+)/g, '<ul class="my-2 space-y-1">$1</ul>');
  // Clean up <br/> inside <ul>
  html = html.replace(/<ul class="my-2 space-y-1">(.*?)<\/ul>/gs, (match, inner) => {
    return '<ul class="my-2 space-y-1">' + inner.replace(/<br\/>/g, '') + '</ul>';
  });
  
  return html;
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWidgetMessage({ message }) {
  const isUser = message.role === "user";
  const isTyping = !isUser && message.content === "Yazıyor...";
  
  const renderedContent = useMemo(() => {
    if (isTyping || isUser) return null;
    return parseMarkdown(message.content);
  }, [message.content, isTyping, isUser]);

  return (
    <div className={`flex w-full mt-4 space-x-3 max-w-full ${isUser ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
        isUser 
          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400" 
          : "bg-gradient-to-br from-pink-500 to-rose-600 text-white"
      }`}>
        {isUser ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.27a2 2 0 0 1-3.46 0H6.73a2 2 0 0 1-3.46 0H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2"></path>
            <path d="M7.5 13a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0"></path>
            <path d="M13.5 13a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0"></path>
          </svg>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`relative px-4 py-2.5 text-[0.9rem] leading-relaxed shadow-sm ${
          isTyping ? "bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm text-zinc-500" :
          isUser ? "bg-pink-600 text-white rounded-2xl rounded-tr-sm" : 
          "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tl-sm border border-zinc-100 dark:border-zinc-700/50"
        }`}>
          {isTyping ? (
            <div className="flex space-x-1.5 items-center h-5 px-1">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          ) : isUser ? (
            <div className="break-words">{message.content}</div>
          ) : (
            <div
              className="break-words"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          )}
        </div>
        {message.timestamp && (
          <div className="text-[0.65rem] text-zinc-400 dark:text-zinc-500 mt-1 mx-1">
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}

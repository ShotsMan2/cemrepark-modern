"use client";

import { useMemo } from "react";

function parseMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="chat-inline-code">$1</code>')
    .replace(/^[\-\•]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br/>');
  
  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/((?:<li>.*?<\/li>(?:<br\/>)?)+)/g, '<ul class="chat-list">$1</ul>');
  // Clean up <br/> inside <ul>
  html = html.replace(/<ul class="chat-list">(.*?)<\/ul>/gs, (match, inner) => {
    return '<ul class="chat-list">' + inner.replace(/<br\/>/g, '') + '</ul>';
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
    <div className={`chat-widget-message ${isUser ? "user" : "assistant"}`}>
      {/* Avatar */}
      <div className={`chat-widget-avatar ${isUser ? "user" : "assistant"}`}>
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

      <div className="chat-widget-message-content">
        {isTyping ? (
          <div className="chat-widget-typing">
            <span className="chat-typing-dot"></span>
            <span className="chat-typing-dot"></span>
            <span className="chat-typing-dot"></span>
          </div>
        ) : isUser ? (
          <div className="chat-widget-message-text">{message.content}</div>
        ) : (
          <div
            className="chat-widget-message-text"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        )}
        {message.timestamp && (
          <div className="chat-widget-timestamp">{formatTime(message.timestamp)}</div>
        )}
      </div>
    </div>
  );
}

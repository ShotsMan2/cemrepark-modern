"use client";

const QUICK_ACTIONS = [
  { icon: "🛒", label: "Sepetimi göster", message: "Sepetimde neler var?" },
  { icon: "📦", label: "Sipariş durumum", message: "Son siparişimin durumu nedir?" },
  { icon: "👗", label: "Ürün öner", message: "Bana uygun ürün önerir misin?" },
  { icon: "❓", label: "Kargo & İade", message: "Kargo ve iade koşulları nelerdir?" },
];

export default function ChatWidgetQuickActions({ onAction }) {
  return (
    <div className="chat-widget-quick-actions">
      {QUICK_ACTIONS.map((action, index) => (
        <button
          key={index}
          className="chat-widget-quick-btn"
          onClick={() => onAction(action.message)}
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <span className="chat-widget-quick-icon">{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}

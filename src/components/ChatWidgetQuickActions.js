"use client";

const QUICK_ACTIONS = [
  { icon: "🛒", label: "Sepetimi göster", message: "Sepetimde neler var?" },
  { icon: "📦", label: "Sipariş durumum", message: "Son siparişimin durumu nedir?" },
  { icon: "👗", label: "Ürün öner", message: "Bana uygun ürün önerir misin?" },
  { icon: "❓", label: "Kargo & İade", message: "Kargo ve iade koşulları nelerdir?" },
];

export default function ChatWidgetQuickActions({ onAction }) {
  return (
    <div className="flex flex-col gap-2 mt-4 w-full">
      {QUICK_ACTIONS.map((action, index) => (
        <button
          key={index}
          className="group flex items-center gap-3 w-full p-3 rounded-xl bg-white/50 dark:bg-zinc-800/50 hover:bg-pink-50 dark:hover:bg-pink-900/20 border border-zinc-200 dark:border-zinc-700 hover:border-pink-300 dark:hover:border-pink-500/50 transition-all duration-300 text-left"
          onClick={() => onAction(action.message)}
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-zinc-700 shadow-sm group-hover:scale-110 transition-transform duration-300 text-base">
            {action.icon}
          </span>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}

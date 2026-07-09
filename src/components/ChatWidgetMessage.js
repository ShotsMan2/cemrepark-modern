export default function ChatWidgetMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`chat-widget-message ${isUser ? "user" : "assistant"}`}>
      <div className="chat-widget-message-text">{message.content}</div>
    </div>
  );
}

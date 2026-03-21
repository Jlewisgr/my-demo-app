"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "bot" | "user";
  content: string;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "## 👋 Welcome to RepWatch\n\nWhat issue do you care about today?",
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const resizeTextarea = () => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 160) + "px";
  };

  useEffect(() => {
    resizeTextarea();
  }, [input]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const botMessage: Message = {
      role: "bot",
      content: generateMockResponse(input),
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "52px";
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          height: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* CHAT */}
        <div
          ref={chatContainerRef}
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {messages.map((message, index) => {
            const isUser = message.role === "user";

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "12px",
                    borderRadius: "12px",
                    backgroundColor: isUser ? "#2563eb" : "white",
                    color: isUser ? "white" : "black",
                  }}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            );
          })}
        </div>

        {/* INPUT */}
        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your issue..."
            style={{
              flex: 1,
              resize: "none",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              maxHeight: "150px",
              overflowY: "auto",
            }}
          />

          <button
            onClick={handleSend}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              padding: "0 20px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}

function generateMockResponse(issue: string) {
  return `
## 🔍 Analyzing Issue

You said: **${issue}**

I’ll connect this to your representative and suggest actions shortly.
`;
}
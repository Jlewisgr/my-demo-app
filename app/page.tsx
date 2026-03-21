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
    const newHeight = Math.min(textareaRef.current.scrollHeight, 160);
    textareaRef.current.style.height = `${newHeight}px`;
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

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "52px";
      }
    });
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f8fafc, #e2e8f0)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          height: "85vh",
          backgroundColor: "white",
          borderRadius: "20px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#0f172a",
            color: "white",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "28px" }}>RepWatch</h1>
          <p style={{ margin: "8px 0 0 0", color: "#cbd5e1" }}>
            Turn frustration into civic action in minutes.
          </p>
        </div>

        {/* CHAT */}
        <div
          ref={chatContainerRef}
          style={{
            flex: 1,
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            backgroundColor: "#f8fafc",
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
                    padding: "14px 16px",
                    borderRadius: "16px",
                    backgroundColor: isUser ? "#2563eb" : "white",
                    color: isUser ? "white" : "#111827",
                    border: isUser ? "none" : "1px solid #e5e7eb",
                    boxShadow: isUser
                      ? "0 6px 18px rgba(37, 99, 235, 0.18)"
                      : "0 4px 12px rgba(0,0,0,0.06)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    lineHeight: "1.5",
                  }}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p style={{ margin: "6px 0" }}>{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong style={{ fontWeight: 600 }}>{children}</strong>
                      ),
                      li: ({ children }) => (
                        <li style={{ marginLeft: "20px" }}>{children}</li>
                      ),
                      h2: ({ children }) => (
                        <h2 style={{ margin: "8px 0", fontSize: "18px" }}>
                          {children}
                        </h2>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            );
          })}
        </div>

        {/* INPUT */}
        <div
          style={{
            padding: "18px",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-end",
              border: "1px solid #cbd5e1",
              borderRadius: "16px",
              padding: "10px",
              backgroundColor: "#ffffff",
            }}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Type an issue like housing, climate, education..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              style={{
                flex: 1,
                width: "100%",
                minWidth: 0,
                height: "52px",
                maxHeight: "160px",
                border: "none",
                outline: "none",
                resize: "none",
                fontSize: "16px",
                lineHeight: "1.5",
                padding: "10px 12px",
                fontFamily: "inherit",
                backgroundColor: "transparent",
                boxSizing: "border-box",
                overflowY: "auto",
                overflowX: "hidden",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            />

            <button
              onClick={handleSend}
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "0 22px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                height: "48px",
                flexShrink: 0,
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function generateMockResponse(issue: string) {
  const lowerIssue = issue.toLowerCase();

  if (lowerIssue.includes("housing")) {
    return `
## 🏠 Housing Issue Detected

Your representative **voted AGAINST** a housing affordability bill.

### Why it matters:
- Rent is increasing
- Limited affordable housing
- Fewer tenant protections

### What you can do:
- 📞 Call their office
- ✉️ Send an email
- 🗳️ Stay informed
`;
  }

  if (lowerIssue.includes("climate")) {
    return `
## 🌍 Climate Policy

Your representative has **supported climate initiatives**.

### Next steps:
- Learn about upcoming legislation
- Contact their office to reinforce support
`;
  }

  return `
## So what youre saying is
Micheal petrovan is gay?
`;
} 

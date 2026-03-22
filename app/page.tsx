"use client";
 
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
 
type Message = {
  role: "bot" | "user";
  content: string;
};
 
const SYSTEM_PROMPT = `You are the Pocket Lobbyist AI assistant — a neutral, nonpartisan civic guide.
 
Your job is to help users:
- Understand their political views and which issues matter most to them
- Track how their local, state, and federal representatives vote on those issues
- Interpret recent votes in plain language (always label AI-generated summaries clearly)
- Suggest actions: signing petitions, emailing reps, calling offices, setting election reminders
 
Rules you must always follow:
- Stay strictly neutral and nonpartisan. Never express opinions on parties, candidates, or policies.
- Present all political data factually and without bias.
- Always label AI-generated vote summaries with "[AI Summary]".
- Respect user autonomy — offer options, never push a specific political direction.
- If a user shares their stance on an issue, acknowledge it and explain you'll use it to track relevant votes.
- Keep responses concise and actionable. Use markdown formatting for clarity.
- If you don't know a specific vote or rep's record, say so clearly rather than guessing.
 
IMPORTANT: Whenever the user mentions a political issue they care about (e.g. healthcare, climate, housing, gun policy, immigration, education, economy), you must include a special line at the very end of your response in this exact format:
SAVE_ISSUE: <short issue label>
 
Only include this line if a new issue was clearly expressed. Do not include it for general questions or follow-ups.`;
 
async function saveIssueToFirestore(issue: string) {
  const user = auth.currentUser;
  if (!user) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await setDoc(ref, { issues: arrayUnion(issue) }, { merge: true });
  } else {
    await setDoc(ref, { issues: [issue] });
  }
}
 
const SUGGESTED_PROMPTS = [
  "Who are my representatives?",
  "How did my reps vote on climate bills?",
  "Help me contact my senator",
  "What issues are being voted on this week?",
];
 
export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "## Welcome to Pocket Lobbyist\n\nI'm your nonpartisan civic assistant. Tell me your ZIP code to get started, or ask me anything about your representatives and how they vote.",
    },
  ]);
 
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
 
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);
 
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 160) + "px";
  }, [input]);
 
  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
 
    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
 
    if (textareaRef.current) textareaRef.current.style.height = "52px";
 
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: updatedMessages.map((m) => ({
            role: m.role === "bot" ? "assistant" : "user",
            content: m.content,
          })),
        }),
      });
 
      const data = await response.json();
      let reply = data?.content?.[0]?.text ?? "Sorry, I couldn't get a response.";
 
      const issueMatch = reply.match(/SAVE_ISSUE:\s*(.+)/);
      if (issueMatch) {
        await saveIssueToFirestore(issueMatch[1].trim());
        reply = reply.replace(/SAVE_ISSUE:\s*.+/, "").trim();
      }
 
      setMessages((prev) => [...prev, { role: "bot", content: reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };
 
  const showSuggestions = messages.length === 1;
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap');
 
        .chat-page {
          min-height: 100vh;
          background: #0d1117;
          display: flex;
          flex-direction: column;
          font-family: 'DM Sans', sans-serif;
        }
 
        .chat-hero {
          background: linear-gradient(135deg, #0d1117 0%, #1a2332 50%, #0d1117 100%);
          border-bottom: 1px solid rgba(201, 168, 76, 0.2);
          padding: 20px 32px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
 
        .chat-hero-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #c9a84c, #e8c96d);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
 
        .chat-hero-text h2 {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          color: #f0ead6;
          margin: 0;
          line-height: 1.2;
        }
 
        .chat-hero-text p {
          font-size: 12px;
          color: #6b7a8d;
          margin: 2px 0 0;
        }
 
        .chat-hero-badge {
          margin-left: auto;
          font-size: 11px;
          color: #c9a84c;
          background: rgba(201, 168, 76, 0.1);
          border: 1px solid rgba(201, 168, 76, 0.25);
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 500;
        }
 
        .chat-body {
          flex: 1;
          max-width: 860px;
          width: 100%;
          margin: 0 auto;
          padding: 24px 24px 0;
          display: flex;
          flex-direction: column;
          height: calc(100vh - 140px);
        }
 
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-bottom: 16px;
          scrollbar-width: thin;
          scrollbar-color: #2a3444 transparent;
        }
 
        .chat-messages::-webkit-scrollbar {
          width: 4px;
        }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb {
          background: #2a3444;
          border-radius: 2px;
        }
 
        .msg-row {
          display: flex;
          gap: 10px;
          animation: fadeUp 0.25s ease;
        }
 
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
 
        .msg-row.user { justify-content: flex-end; }
 
        .bot-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #c9a84c, #e8c96d);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 2px;
        }
 
        .msg-bubble {
          max-width: 72%;
          padding: 14px 18px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.6;
        }
 
        .msg-bubble.bot {
          background: #1a2332;
          color: #c8d6e5;
          border: 1px solid #2a3a50;
          border-top-left-radius: 4px;
        }
 
        .msg-bubble.user {
          background: linear-gradient(135deg, #1e4a9e, #2563eb);
          color: #fff;
          border-top-right-radius: 4px;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
        }
 
        .msg-bubble.bot h1,
        .msg-bubble.bot h2,
        .msg-bubble.bot h3 {
          font-family: 'Playfair Display', serif;
          color: #f0ead6;
          margin: 0 0 8px;
          font-size: 16px;
        }
 
        .msg-bubble.bot strong { color: #c9a84c; }
        .msg-bubble.bot p { margin: 6px 0; }
        .msg-bubble.bot ul { padding-left: 18px; margin: 6px 0; }
        .msg-bubble.bot li { margin: 3px 0; }
        .msg-bubble.bot code {
          background: rgba(201, 168, 76, 0.1);
          color: #c9a84c;
          padding: 1px 5px;
          border-radius: 3px;
          font-size: 12px;
        }
 
        .typing-indicator {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
 
        .typing-dots {
          background: #1a2332;
          border: 1px solid #2a3a50;
          border-radius: 16px;
          border-top-left-radius: 4px;
          padding: 16px 20px;
          display: flex;
          gap: 5px;
          align-items: center;
        }
 
        .typing-dots span {
          width: 6px;
          height: 6px;
          background: #c9a84c;
          border-radius: 50%;
          animation: bounce 1.2s infinite;
          opacity: 0.6;
        }
 
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
 
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
 
        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 4px;
        }
 
        .suggestion-chip {
          background: transparent;
          border: 1px solid #2a3a50;
          color: #8a9bb0;
          padding: 7px 14px;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
 
        .suggestion-chip:hover {
          border-color: #c9a84c;
          color: #c9a84c;
          background: rgba(201, 168, 76, 0.06);
        }
 
        .chat-input-area {
          padding: 16px 0 24px;
          border-top: 1px solid #1e2d3d;
          margin-top: 8px;
        }
 
        .input-row {
          display: flex;
          gap: 10px;
          align-items: flex-end;
          background: #1a2332;
          border: 1px solid #2a3a50;
          border-radius: 14px;
          padding: 10px 10px 10px 16px;
          transition: border-color 0.2s;
        }
 
        .input-row:focus-within {
          border-color: rgba(201, 168, 76, 0.5);
        }
 
        .chat-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #c8d6e5;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          resize: none;
          line-height: 1.5;
          max-height: 150px;
          overflow-y: auto;
          padding: 4px 0;
        }
 
        .chat-textarea::placeholder { color: #3d5166; }
 
        .send-btn {
          background: linear-gradient(135deg, #c9a84c, #e8c96d);
          border: none;
          border-radius: 10px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.15s;
        }
 
        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(201, 168, 76, 0.4);
        }
 
        .send-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
 
        .send-btn svg { width: 16px; height: 16px; }
 
        .input-hint {
          font-size: 11px;
          color: #3d5166;
          text-align: center;
          margin-top: 10px;
        }
      `}</style>
 
      <div className="chat-page">
        <div className="chat-hero">
          <div className="chat-hero-icon">🏛️</div>
          <div className="chat-hero-text">
            <h2>Pocket Lobbyist</h2>
            <p>Your nonpartisan civic assistant</p>
          </div>
          <span className="chat-hero-badge">AI · Neutral</span>
        </div>
 
        <div className="chat-body">
          <div className="chat-messages" ref={chatContainerRef}>
            {messages.map((msg, i) => {
              const isUser = msg.role === "user";
              return (
                <div key={i} className={`msg-row ${isUser ? "user" : ""}`}>
                  {!isUser && <div className="bot-avatar">⚖️</div>}
                  <div className={`msg-bubble ${isUser ? "user" : "bot"}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              );
            })}
 
            {loading && (
              <div className="typing-indicator">
                <div className="bot-avatar">⚖️</div>
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            )}
 
            {showSuggestions && !loading && (
              <div className="suggestions">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    className="suggestion-chip"
                    onClick={() => handleSend(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
 
          <div className="chat-input-area">
            <div className="input-row">
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about your representatives, issues, or votes..."
                rows={1}
              />
              <button
                className="send-btn"
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="input-hint">AI summaries are labeled · All data presented neutrally · Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </>
  );
}
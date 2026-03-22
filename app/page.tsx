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
 
export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);
 
  const resizeTextarea = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 160) + "px";
  };
 
  useEffect(() => {
    resizeTextarea();
  }, [input]);
 
  const handleSend = async () => {
    if (!input.trim() || loading) return;
 
    const userMessage: Message = { role: "user", content: input };
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
 
      // Check if Claude flagged an issue to save
      const issueMatch = reply.match(/SAVE_ISSUE:\s*(.+)/);
      if (issueMatch) {
        const issueLabel = issueMatch[1].trim();
        await saveIssueToFirestore(issueLabel);
        // Strip the SAVE_ISSUE line before displaying
        reply = reply.replace(/SAVE_ISSUE:\s*.+/, "").trim();
      }
 
      setMessages((prev) => [...prev, { role: "bot", content: reply }]);
    } catch (err) {
      console.error("Chat error:", err); // 👈 add this line
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", padding: "24px" }}>
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
              <div key={index} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
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
 
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  backgroundColor: "white",
                  color: "#888",
                  fontSize: "20px",
                  letterSpacing: "2px",
                }}
              >
                •••
              </div>
            </div>
          )}
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
            disabled={loading || !input.trim()}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              padding: "0 20px",
              borderRadius: "10px",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              opacity: loading || !input.trim() ? 0.6 : 1,
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </main>
  );
}
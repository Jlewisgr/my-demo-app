"use client";

import { useState } from "react";

// import { db, auth } from "@/lib/firebase";
// import { doc, getDoc } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth";

// TODO: wire up real actions
// const sendEmail = async (repEmail: string, message: string) => { ... }
// const signPetition = async (userId: string, issueId: string) => { ... }
// const shareIssue = async (issue: string) => { ... }

const ACTIONS = [
  {
    id: "call",
    icon: "📞",
    label: "Call Representative",
    description: "Speak directly with your rep's office",
    color: "#2563eb",
    colorBg: "rgba(37,99,235,0.1)",
    colorBorder: "rgba(37,99,235,0.25)",
    // TODO: open phone dialer with rep's number
    // onClick: () => window.open(`tel:${rep.phone}`)
  },
  {
    id: "email",
    icon: "✉️",
    label: "Send Email",
    description: "Send a prewritten message to your rep",
    color: "#c9a84c",
    colorBg: "rgba(201,168,76,0.1)",
    colorBorder: "rgba(201,168,76,0.25)",
    // TODO: open email composer with prewritten AI draft
    // onClick: () => router.push("/compose-email")
  },
  {
    id: "petition",
    icon: "📝",
    label: "Sign Petition",
    description: "Add your name to an active petition",
    color: "#1a7a4a",
    colorBg: "rgba(26,122,74,0.1)",
    colorBorder: "rgba(26,122,74,0.25)",
    // TODO: fetch active petitions from Firestore and display list
    // onClick: () => router.push("/petitions")
  },
  {
    id: "share",
    icon: "📢",
    label: "Share Issue",
    description: "Generate a shareable accountability report",
    color: "#9333ea",
    colorBg: "rgba(147,51,234,0.1)",
    colorBorder: "rgba(147,51,234,0.25)",
    // TODO: generate and share accountability report PDF
    // onClick: () => generateReport(userId, issueId)
  },
  {
    id: "reminder",
    icon: "🗓️",
    label: "Set Election Reminder",
    description: "Get notified before the next election",
    color: "#dc2626",
    colorBg: "rgba(220,38,38,0.1)",
    colorBorder: "rgba(220,38,38,0.25)",
    // TODO: save reminder to Firestore with user's next election date
    // onClick: () => saveReminder(userId, electionDate)
  },
  {
    id: "donate",
    icon: "💸",
    label: "Donate to Opponent",
    description: "Support a challenger in the next election",
    color: "#e8c96d",
    colorBg: "rgba(232,201,109,0.08)",
    colorBorder: "rgba(232,201,109,0.2)",
    // TODO: link to FEC-compliant donation page
    // onClick: () => window.open(opponent.donationUrl)
  },
];

export default function ConnectPage() {
  const [clicked, setClicked] = useState<string | null>(null);

  function handleAction(id: string) {
    setClicked(id);
    // TODO: replace toast with real action handler
    setTimeout(() => setClicked(null), 1800);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { background: #0d1117; }

        .action-card {
          background: #111827;
          border-radius: 14px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: transform 0.15s, border-color 0.2s;
          border: 1px solid #1f2d3d;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
        }

        .action-card:hover {
          transform: translateY(-2px);
        }

        .action-card:active {
          transform: scale(0.98);
        }

        .toast {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          background: #1a2332;
          border: 1px solid rgba(201,168,76,0.3);
          color: #c9a84c;
          padding: 10px 20px;
          border-radius: 20px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          animation: fadeUp 0.2s ease;
          z-index: 999;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <main style={{
        minHeight: "100vh",
        background: "#0d1117",
        padding: "32px 24px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>

          {/* HEADER */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "linear-gradient(135deg, #c9a84c, #e8c96d)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px",
              }}>⚡</div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px", fontWeight: 700,
                color: "#f0ead6", margin: 0,
              }}>Take Action</h1>
            </div>
            <p style={{ color: "#4a6080", fontSize: "14px", margin: "0 0 0 52px" }}>
              Make your voice heard — choose how you want to engage
            </p>
          </div>

          {/* DIVIDER */}
          <div style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)",
            marginBottom: "28px",
          }} />

          {/* ACTION CARDS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {ACTIONS.map((action) => (
              <button
                key={action.id}
                className="action-card"
                style={{
                  borderColor: clicked === action.id ? action.colorBorder : "#1f2d3d",
                }}
                onClick={() => handleAction(action.id)}
              >
                {/* icon */}
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  background: action.colorBg,
                  border: `1px solid ${action.colorBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", flexShrink: 0,
                }}>
                  {action.icon}
                </div>

                {/* text */}
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: "15px", fontWeight: 500,
                    color: "#f0ead6", margin: "0 0 3px",
                  }}>{action.label}</p>
                  <p style={{
                    fontSize: "12px", color: "#4a6080", margin: 0,
                  }}>{action.description}</p>
                </div>

                {/* arrow */}
                <span style={{ color: action.color, fontSize: "18px", flexShrink: 0 }}>→</span>
              </button>
            ))}
          </div>

          {/* FOOTER NOTE */}
          <p style={{
            fontSize: "11px", color: "#2a3a50",
            textAlign: "center", marginTop: "32px",
          }}>
            {/* TODO: connect actions to live rep data and user account */}
            Actions are placeholders · Full functionality coming soon
          </p>
        </div>
      </main>

      {/* TOAST */}
      {clicked && (
        <div className="toast">
          ✓ {ACTIONS.find(a => a.id === clicked)?.label} — coming soon!
        </div>
      )}
    </>
  );
}
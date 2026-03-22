"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// ── Hardcoded current national issues ────────────────────────────────────────
// TODO: replace with live data from ProPublica Congress API or MCP server
const CURRENT_ISSUES = [
  {
    label: "Healthcare",
    icon: "🏥",
    description: "Affordable Care Act funding & insulin price caps",
    status: "Active",
    color: "#2563eb",
    colorBg: "rgba(37,99,235,0.1)",
    colorBorder: "rgba(37,99,235,0.25)",
  },
  {
    label: "Climate & Energy",
    icon: "🌿",
    description: "Clean grid transition & emissions reduction targets",
    status: "In Committee",
    color: "#1a7a4a",
    colorBg: "rgba(26,122,74,0.1)",
    colorBorder: "rgba(26,122,74,0.25)",
  },
  {
    label: "Housing",
    icon: "🏠",
    description: "Federal affordable housing investment act",
    status: "Floor Vote Soon",
    color: "#c9a84c",
    colorBg: "rgba(201,168,76,0.1)",
    colorBorder: "rgba(201,168,76,0.25)",
  },
  {
    label: "Immigration",
    icon: "🛂",
    description: "Border security & asylum processing reform",
    status: "Active",
    color: "#9333ea",
    colorBg: "rgba(147,51,234,0.1)",
    colorBorder: "rgba(147,51,234,0.25)",
  },
  {
    label: "Economy & Jobs",
    icon: "💼",
    description: "Minimum wage increase & small business tax relief",
    status: "In Committee",
    color: "#e8c96d",
    colorBg: "rgba(232,201,109,0.08)",
    colorBorder: "rgba(232,201,109,0.2)",
  },
  {
    label: "Education",
    icon: "🎓",
    description: "Student loan reform & public school funding",
    status: "Active",
    color: "#0891b2",
    colorBg: "rgba(8,145,178,0.1)",
    colorBorder: "rgba(8,145,178,0.25)",
  },
  {
    label: "Gun Policy",
    icon: "⚖️",
    description: "Universal background checks & red flag laws",
    status: "Stalled",
    color: "#dc2626",
    colorBg: "rgba(220,38,38,0.1)",
    colorBorder: "rgba(220,38,38,0.25)",
  },
  {
    label: "Criminal Justice",
    icon: "🏛️",
    description: "Police accountability & sentencing reform",
    status: "In Committee",
    color: "#c9a84c",
    colorBg: "rgba(201,168,76,0.08)",
    colorBorder: "rgba(201,168,76,0.2)",
  },
];

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  "Active":         { bg: "rgba(26,122,74,0.12)",   color: "#4ade80", border: "rgba(26,122,74,0.3)" },
  "In Committee":   { bg: "rgba(201,168,76,0.1)",   color: "#c9a84c", border: "rgba(201,168,76,0.25)" },
  "Floor Vote Soon":{ bg: "rgba(37,99,235,0.12)",   color: "#93b4f7", border: "rgba(37,99,235,0.3)" },
  "Stalled":        { bg: "rgba(220,38,38,0.1)",    color: "#f87171", border: "rgba(220,38,38,0.25)" },
};

type Issue = { label: string; icon: string; description: string; status: string; color: string; colorBg: string; colorBorder: string };

function IssueCard({ issue, saved }: { issue: Issue; saved?: boolean }) {
  const statusStyle = STATUS_COLORS[issue.status] ?? STATUS_COLORS["Active"];

  return (
    <div style={{
      background: "#111827",
      border: `1px solid ${saved ? issue.colorBorder : "#1f2d3d"}`,
      borderRadius: "14px",
      padding: "16px 18px",
      position: "relative",
      overflow: "hidden",
      transition: "border-color 0.2s, transform 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {saved && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: `linear-gradient(90deg, transparent, ${issue.color}66, transparent)`,
        }} />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "10px",
          background: issue.colorBg, border: `1px solid ${issue.colorBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "20px", flexShrink: 0,
        }}>
          {issue.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "3px" }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "15px", fontWeight: 700,
              color: "#f0ead6", margin: 0,
            }}>{issue.label}</h3>
            {saved && (
              <span style={{
                fontSize: "9px", fontWeight: 600,
                background: issue.colorBg, color: issue.color,
                border: `1px solid ${issue.colorBorder}`,
                padding: "1px 6px", borderRadius: "10px",
                textTransform: "uppercase", letterSpacing: "0.5px",
              }}>Following</span>
            )}
          </div>
          <p style={{ fontSize: "12px", color: "#4a6080", margin: "0 0 8px", fontFamily: "'DM Sans', sans-serif" }}>
            {issue.description}
          </p>
          <span style={{
            fontSize: "10px", fontWeight: 500,
            background: statusStyle.bg, color: statusStyle.color,
            border: `1px solid ${statusStyle.border}`,
            padding: "2px 8px", borderRadius: "10px",
            fontFamily: "'DM Sans', sans-serif",
          }}>{issue.status}</span>
        </div>
      </div>
    </div>
  );
}

export default function IssuesPage() {
  const [savedIssues, setSavedIssues] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setLoading(false); return; }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setSavedIssues(snap.data().issues ?? []);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Match saved issue strings to hardcoded issue objects
  const followedIssues = CURRENT_ISSUES.filter(issue =>
    savedIssues.some(s => s.toLowerCase().includes(issue.label.toLowerCase()) ||
      issue.label.toLowerCase().includes(s.toLowerCase()))
  );
  const otherIssues = CURRENT_ISSUES.filter(issue => !followedIssues.includes(issue));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { background: #0d1117; }
      `}</style>

      <main style={{
        minHeight: "100vh",
        background: "#0d1117",
        padding: "32px 24px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>

          {/* HEADER */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "linear-gradient(135deg, #c9a84c, #e8c96d)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px",
              }}>📋</div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px", fontWeight: 700,
                color: "#f0ead6", margin: 0,
              }}>Issues</h1>
            </div>
            <p style={{ color: "#4a6080", fontSize: "14px", margin: "0 0 0 52px" }}>
              Track legislation you care about · Chat to follow new issues
            </p>
          </div>

          <div style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)",
            marginBottom: "28px",
          }} />

          {/* YOUR FOLLOWED ISSUES */}
          {loading ? (
            <div style={{ color: "#4a6080", fontSize: "14px", textAlign: "center", padding: "40px 0" }}>
              Loading your issues...
            </div>
          ) : followedIssues.length > 0 ? (
            <div style={{ marginBottom: "36px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "18px", fontWeight: 700,
                  color: "#f0ead6", margin: 0,
                }}>Following</h2>
                <span style={{
                  fontSize: "11px", fontWeight: 500,
                  background: "rgba(201,168,76,0.1)", color: "#c9a84c",
                  border: "1px solid rgba(201,168,76,0.2)",
                  padding: "2px 8px", borderRadius: "20px",
                }}>{followedIssues.length}</span>
              </div>
              <div style={{ display: "grid", gap: "12px" }}>
                {followedIssues.map(issue => (
                  <IssueCard key={issue.label} issue={issue} saved />
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              background: "#111827",
              border: "1px dashed #1f2d3d",
              borderRadius: "14px",
              padding: "28px",
              textAlign: "center",
              marginBottom: "36px",
            }}>
              <p style={{ fontSize: "24px", margin: "0 0 8px" }}>💬</p>
              <p style={{ color: "#4a6080", fontSize: "14px", margin: 0 }}>
                No issues followed yet — chat with the AI to add some
              </p>
            </div>
          )}

          {/* ALL CURRENT ISSUES */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "18px", fontWeight: 700,
                color: "#f0ead6", margin: 0,
              }}>Current Issues in Congress</h2>
              <span style={{
                fontSize: "11px", fontWeight: 500,
                background: "rgba(201,168,76,0.1)", color: "#c9a84c",
                border: "1px solid rgba(201,168,76,0.2)",
                padding: "2px 8px", borderRadius: "20px",
              }}>{otherIssues.length}</span>
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              {otherIssues.map(issue => (
                <IssueCard key={issue.label} issue={issue} />
              ))}
            </div>
          </div>

          <p style={{ fontSize: "11px", color: "#2a3a50", textAlign: "center", marginTop: "32px" }}>
            {/* TODO: replace hardcoded issues with live ProPublica Congress API data */}
            Issues are hardcoded for demo · Live bill tracking coming soon
          </p>
        </div>
      </main>
    </>
  );
}
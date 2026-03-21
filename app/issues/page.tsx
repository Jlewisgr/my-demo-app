"use client";

import { useEffect, useState } from "react";

export default function IssuesPage() {
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("issues") || "[]");
    setIssues(stored.reverse());
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Your Issues</h1>

      {issues.length === 0 && (
        <p>No issues yet. Go chat to add some.</p>
      )}

      <div style={{ marginTop: "20px", display: "grid", gap: "12px" }}>
        {issues.map((issue, i) => (
          <div
            key={i}
            style={{
              padding: "12px",
              borderRadius: "10px",
              background: "#f1f5f9",
            }}
          >
            {issue.issue}
          </div>
        ))}
      </div>
    </div>
  );
}
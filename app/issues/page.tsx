"use client";
 
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
 
export default function IssuesPage() {
  const [issues, setIssues] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    // Wait for auth to resolve before reading Firestore
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
 
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
 
      if (snap.exists()) {
        const data = snap.data();
        setIssues(data.issues ?? []);
      }
 
      setLoading(false);
    });
 
    return () => unsub();
  }, []);
 
  return (
    <div style={{ padding: "40px" }}>
      <h1>Your Issues</h1>
 
      {loading && <p style={{ color: "#888" }}>Loading...</p>}
 
      {!loading && issues.length === 0 && (
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
            {issue}
          </div>
        ))}
      </div>
    </div>
  );
}
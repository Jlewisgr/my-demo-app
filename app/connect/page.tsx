"use client";

export default function ConnectPage() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>Take Action</h1>

      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <button style={btn}>📞 Call Representative</button>
        <button style={btn}>✉️ Send Email</button>
        <button style={btn}>📝 Sign Petition</button>
        <button style={btn}>📢 Share Issue</button>
      </div>
    </div>
  );
}

const btn = {
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "white",
};
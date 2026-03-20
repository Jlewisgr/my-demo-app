import Link from "next/link";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* NAVBAR */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            backgroundColor: "#0f172a",
            color: "white",
          }}
        >
          {/* LEFT SIDE */}
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/">
              <button style={navBtn}>Home</button>
            </Link>

            <Link href="/issues">
              <button style={navBtn}>See Issues</button>
            </Link>

            <Link href="/reps">
              <button style={navBtn}>Get Reps</button>
            </Link>

            <Link href="/connect">
              <button style={navBtn}>Get Connected</button>
            </Link>
          </div>

          {/* RIGHT SIDE */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              placeholder="Search"
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border: "none",
              }}
            />

            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#1e293b",
              }}
            />
          </div>
        </div>

        {/* PAGE CONTENT */}
        {children}
      </body>
    </html>
  );
}

const navBtn = {
  backgroundColor: "#1e293b",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
};
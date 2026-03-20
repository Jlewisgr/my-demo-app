"use client";

import Link from "next/link";
import "./globals.css";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<null | { name: string }>(null);
  const [open, setOpen] = useState(false);

  const handleLogin = () => {
    // fake login (for now)
    setUser({ name: "Jagger" });
  };

  const handleLogout = () => {
    setUser(null);
    setOpen(false);
  };

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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              placeholder="Search"
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border: "none",
              }}
            />

            {/* 👤 AUTH AREA */}
            {!user ? (
              <button
                onClick={handleLogin}
                style={{
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Sign In
              </button>
            ) : (
              <div style={{ position: "relative" }}>
                <div
                  onClick={() => setOpen(!open)}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {user.name[0]}
                </div>

                {/* DROPDOWN */}
                {open && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "45px",
                      backgroundColor: "white",
                      color: "black",
                      borderRadius: "10px",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                      padding: "10px",
                      minWidth: "150px",
                    }}
                  >
                    <div style={{ padding: "8px" }}>
                      👋 {user.name}
                    </div>

                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

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

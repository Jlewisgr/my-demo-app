"use client";

import Link from "next/link";
import "./globals.css";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  // 🔥 Listen for login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
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
          {/* LEFT */}
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

          {/* RIGHT */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              placeholder="Search"
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border: "none",
              }}
            />

            {/* 🔥 AUTH UI */}
            {!user ? (
              <Link href="/login">
                <button
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
              </Link>
            ) : (
              <div style={{ position: "relative" }}>
                {/* PROFILE */}
                <img
                  src={user.photoURL || ""}
                  alt="profile"
                  onClick={() => setOpen(!open)}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                />

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
                      minWidth: "180px",
                    }}
                  >
                    <div style={{ padding: "8px", fontWeight: 600 }}>
                      {user.displayName}
                    </div>

                    <div style={{ padding: "8px", fontSize: "12px" }}>
                      {user.email}
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
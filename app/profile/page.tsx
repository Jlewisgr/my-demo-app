"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ProfilePage() {
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhoto, setUserPhoto] = useState("");

  // Load existing profile from Firestore
  useEffect(() => {
    const loadUser = async () => {
      const user = auth.currentUser;
      if (!user) { setLoading(false); return; }

      setUserName(user.displayName ?? "");
      setUserEmail(user.email ?? "");
      setUserPhoto(user.photoURL ?? "");

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setAddress(snap.data().address || "");
        }
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  // Nominatim autocomplete
  const handleAddressChange = async (value: string) => {
    setAddress(value);
    setSaved(false);

    if (value.length < 4) { setSuggestions([]); return; }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      setSuggestions(data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  // Save address to Firestore
  const saveAddress = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    setError("");

    try {
      await setDoc(doc(db, "users", user.uid), { address }, { merge: true });
      setSaved(true);
      // TODO: after saving address, trigger rep lookup via Google Civic API
      // await fetchAndSaveReps(address, user.uid);
    } catch (err) {
      console.error(err);
      setError("Error saving address — please try again.");
    } finally {
      setSaving(false);
    }
  };

  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#4a6080", fontFamily: "'DM Sans', sans-serif" }}>Loading profile...</p>
      </main>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { background: #0d1117; }

        .profile-input {
          width: 100%;
          background: #0d1117;
          border: 1px solid #1f2d3d;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #c8d6e5;
          outline: none;
          transition: border-color 0.2s;
        }

        .profile-input::placeholder { color: #2a3a50; }

        .profile-input:focus { border-color: rgba(201,168,76,0.4); }

        .suggestion-item {
          padding: 10px 14px;
          font-size: 13px;
          color: #8a9bb0;
          cursor: pointer;
          border-bottom: 1px solid #1a2332;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }

        .suggestion-item:last-child { border-bottom: none; }

        .suggestion-item:hover {
          background: #1a2332;
          color: #f0ead6;
        }

        .save-btn {
          width: 100%;
          padding: 13px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #c9a84c, #e8c96d);
          color: #0d1117;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(201,168,76,0.3);
        }

        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <main style={{
        minHeight: "100vh",
        background: "#0d1117",
        padding: "32px 24px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>

          {/* HEADER */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "linear-gradient(135deg, #c9a84c, #e8c96d)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px",
              }}>👤</div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px", fontWeight: 700,
                color: "#f0ead6", margin: 0,
              }}>Your Profile</h1>
            </div>
            <p style={{ color: "#4a6080", fontSize: "14px", margin: "0 0 0 52px" }}>
              Manage your account and location settings
            </p>
          </div>

          <div style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)",
            marginBottom: "28px",
          }} />

          {/* ACCOUNT CARD */}
          <div style={{
            background: "#111827",
            border: "1px solid #1f2d3d",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}>
            {userPhoto ? (
              <img src={userPhoto} alt={userName} style={{
                width: "52px", height: "52px", borderRadius: "12px",
                objectFit: "cover", flexShrink: 0,
                border: "1px solid #1f2d3d",
              }} />
            ) : (
              <div style={{
                width: "52px", height: "52px", borderRadius: "12px",
                background: "rgba(201,168,76,0.15)",
                color: "#c9a84c",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700, fontSize: "18px", flexShrink: 0,
              }}>
                {getInitials(userName)}
              </div>
            )}

            <div>
              <p style={{ fontSize: "15px", fontWeight: 500, color: "#f0ead6", margin: "0 0 3px" }}>
                {userName || "Anonymous"}
              </p>
              <p style={{ fontSize: "12px", color: "#4a6080", margin: 0 }}>{userEmail}</p>
            </div>

            {/* TODO: add sign out button */}
            {/* <button onClick={() => signOut(auth)} style={{ marginLeft: "auto" }}>Sign out</button> */}
          </div>

          {/* ADDRESS CARD */}
          <div style={{
            background: "#111827",
            border: "1px solid #1f2d3d",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "16px",
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "16px", fontWeight: 700,
              color: "#f0ead6", margin: "0 0 6px",
            }}>Home Address</h2>
            <p style={{ fontSize: "12px", color: "#4a6080", margin: "0 0 16px" }}>
              Used to look up your local, state, and federal representatives
            </p>

            <div style={{ position: "relative" }}>
              <input
                className="profile-input"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="Start typing your address..."
              />

              {/* AUTOCOMPLETE DROPDOWN */}
              {suggestions.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0, right: 0,
                  background: "#111827",
                  border: "1px solid #1f2d3d",
                  borderRadius: "10px",
                  overflow: "hidden",
                  zIndex: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}>
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="suggestion-item"
                      onClick={() => {
                        setAddress(s.display_name);
                        setSuggestions([]);
                      }}
                    >
                      📍 {s.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button
            className="save-btn"
            onClick={saveAddress}
            disabled={saving || !address.trim()}
          >
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Address"}
          </button>

          {/* ERROR */}
          {error && (
            <p style={{
              fontSize: "12px", color: "#f87171",
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: "8px", padding: "8px 12px",
              marginTop: "12px", textAlign: "center",
            }}>{error}</p>
          )}

          {/* SUCCESS */}
          {saved && (
            <p style={{
              fontSize: "12px", color: "#4ade80",
              background: "rgba(26,122,74,0.08)",
              border: "1px solid rgba(26,122,74,0.2)",
              borderRadius: "8px", padding: "8px 12px",
              marginTop: "12px", textAlign: "center",
            }}>
              Address saved — your reps will update shortly
              {/* TODO: trigger live rep lookup here */}
            </p>
          )}

          <p style={{ fontSize: "11px", color: "#2a3a50", textAlign: "center", marginTop: "24px" }}>
            {/* TODO: add account deletion and data export options */}
            Address data is used only to look up your representatives
          </p>
        </div>
      </main>
    </>
  );
}
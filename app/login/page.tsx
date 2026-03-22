"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await signInWithPopup(auth, provider);
      const user = result.user; // use result.user directly, not auth.currentUser

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // Create user doc if first time signing in
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          zipcode: "",
          issues: [],
          createdAt: new Date(),
        });
      }

      // Hard redirect — bypasses any Next.js router issues
      window.location.href = "/";
    } catch (err) {
      console.error("Login error:", err);
      setError("Sign in failed — please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d1117; }

        .login-page {
          min-height: 100vh;
          background: #0d1117;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          padding: 24px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: #111827;
          border: 1px solid #1f2d3d;
          border-radius: 20px;
          padding: 40px 36px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .card-glow {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #c9a84c, transparent);
        }

        .logo-wrap {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: linear-gradient(135deg, #c9a84c, #e8c96d);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          margin: 0 auto 20px;
        }

        .login-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: #f0ead6;
          margin-bottom: 8px;
        }

        .login-subtitle {
          font-size: 14px;
          color: #4a6080;
          line-height: 1.5;
          margin-bottom: 32px;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #1f2d3d, transparent);
          margin-bottom: 28px;
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 28px;
          text-align: left;
        }

        .feature-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #6b7a8d;
        }

        .feature-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c9a84c;
          flex-shrink: 0;
        }

        .google-btn {
          width: 100%;
          padding: 14px 20px;
          border-radius: 12px;
          border: 1px solid #2a3a50;
          background: #0d1117;
          color: #f0ead6;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.2s;
        }

        .google-btn:hover:not(:disabled) {
          border-color: rgba(201,168,76,0.4);
          background: #161f2e;
        }

        .google-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .google-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .google-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .error-msg {
          font-size: 12px;
          color: #f87171;
          margin-top: 12px;
          background: rgba(220,38,38,0.08);
          border: 1px solid rgba(220,38,38,0.2);
          border-radius: 8px;
          padding: 8px 12px;
        }

        .footer-note {
          font-size: 11px;
          color: #2a3a50;
          margin-top: 20px;
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          <div className="card-glow" />

          <div className="logo-wrap">🏛️</div>

          <h1 className="login-title">Pocket Lobbyist</h1>
          <p className="login-subtitle">
            Your nonpartisan civic assistant.<br />
            Track your reps, follow issues, make your voice heard.
          </p>

          <div className="divider" />

          <div className="features">
            <div className="feature-row">
              <div className="feature-dot" />
              Track how your representatives vote
            </div>
            <div className="feature-row">
              <div className="feature-dot" />
              Get alerts on issues you care about
            </div>
            <div className="feature-row">
              <div className="feature-dot" />
              Take action — call, email, petition
            </div>
            <div className="feature-row">
              <div className="feature-dot" />
              All data presented neutrally
            </div>
          </div>

          <button
            className="google-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          {error && <p className="error-msg">{error}</p>}

          <p className="footer-note">
            {/* TODO: add Terms of Service and Privacy Policy links */}
            By signing in you agree to our Terms of Service
          </p>
        </div>
      </div>
    </>
  );
}
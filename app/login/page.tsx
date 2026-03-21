"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      console.log("Starting login...");

      const result = await signInWithPopup(auth, provider);

      console.log("SUCCESS:", result.user);

      router.push("/");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert("Login failed. Check console.");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f8fafc",
      }}
    >
      <button
        onClick={handleLogin}
        style={{
          padding: "16px 24px",
          fontSize: "18px",
          borderRadius: "10px",
          border: "none",
          backgroundColor: "#2563eb",
          color: "white",
          cursor: "pointer",
        }}
      >
        Continue with Google
      </button>
    </div>
  );
}
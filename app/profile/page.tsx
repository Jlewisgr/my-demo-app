"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ProfilePage() {
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Load existing address
  useEffect(() => {
    const loadUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

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

  // 🔥 Handle typing + autocomplete
  const handleAddressChange = async (value: string) => {
    setAddress(value);

    if (value.length < 4) {
      setSuggestions([]);
      return;
    }

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

  // 🔥 Save address
  const saveAddress = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await setDoc(
        doc(db, "users", user.uid),
        { address },
        { merge: true }
      );

      alert("Address saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving address");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Your Profile</h1>

      <p>Set your home address:</p>

      <input
        value={address}
        onChange={(e) => handleAddressChange(e.target.value)}
        placeholder="Start typing your address..."
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          width: "320px",
          marginTop: "10px"
        }}
      />

      {/* 🔽 AUTOCOMPLETE DROPDOWN */}
      {suggestions.length > 0 && (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            marginTop: "5px",
            maxWidth: "320px",
            background: "white"
          }}
        >
          {suggestions.map((s, i) => (
            <div
              key={i}
              onClick={() => {
                setAddress(s.display_name);
                setSuggestions([]);
              }}
              style={{
                padding: "8px",
                cursor: "pointer"
              }}
            >
              {s.display_name}
            </div>
          ))}
        </div>
      )}

      <br /><br />

      <button onClick={saveAddress}>
        Save Address
      </button>
    </div>
  );
}
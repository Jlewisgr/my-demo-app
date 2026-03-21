"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ProfilePage() {
  const [address, setAddress] = useState("");
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
        onChange={(e) => setAddress(e.target.value)}
        placeholder="123 E Apache Blvd, Tempe, AZ"
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          width: "320px",
          marginTop: "10px"
        }}
      />

      <br /><br />

      <button onClick={saveAddress}>
        Save Address
      </button>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [zipcode, setZipcode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setLoading(false);
        return;
      }

      setUser(u);

      const docRef = doc(db, "users", u.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setZipcode(snap.data().zipcode || "");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      zipcode,
    });

    alert("Zipcode saved!");
  };

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading...</div>;
  }

  if (!user) {
    return <div style={{ padding: "40px" }}>Not logged in</div>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Your Profile</h1>

      <p><strong>Name:</strong> {user.displayName}</p>
      <p><strong>Email:</strong> {user.email}</p>

      <div style={{ marginTop: "20px" }}>
        <input
          value={zipcode}
          onChange={(e) => setZipcode(e.target.value)}
          placeholder="Enter your zipcode"
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        />

        <button onClick={handleSave}>
          Save Zipcode
        </button>
      </div>
    </div>
  );
}
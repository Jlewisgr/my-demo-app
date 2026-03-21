"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function ProfilePage() {
  const [zipcode, setZipcode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setZipcode(snap.data().zipcode || "");
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      zipcode,
    });

    alert("Zipcode saved!");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Your Profile</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
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

          <button onClick={handleSave}>Save</button>
        </>
      )}
    </div>
  );
}
<h1>MAP PAGE TEST</h1>
"use client";

import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// 🔥 GeoJSON source (reliable)
const geoUrl =
  "https://unpkg.com/us-atlas@3/states-10m.json";

// 🔥 Basic ZIP → STATE mapping (expand later)
const zipToState = (zip: string) => {
  const num = parseInt(zip);

  if (num >= 85000 && num <= 86999) return "Arizona";
  if (num >= 90000 && num <= 96162) return "California";
  if (num >= 10000 && num <= 14999) return "New York";

  return null;
};

export default function RepsPage() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [zipcode, setZipcode] = useState<string>("");

  // 🔥 Load zipcode from Firebase
  useEffect(() => {
    const loadUser = async () => {
      const user = auth.currentUser;

      if (!user) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const zip = snap.data().zipcode;
          setZipcode(zip);

          const state = zipToState(zip);
          if (state) {
            setSelectedState(state);
          }
        }
      } catch (err) {
        console.error("Firestore error:", err);
      }
    };

    loadUser();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Find Your Representatives</h1>

      {zipcode && <p>Your zipcode: {zipcode}</p>}

      {/* 🔥 MAP FIXED WITH HEIGHT */}
      <div style={{ width: "100%", height: "500px", marginTop: "20px" }}>
        <ComposableMap
          projection="geoAlbersUsa"
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }: any) =>
              geographies.map((geo: any) => {
                const state = geo.properties.name;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => setSelectedState(state)}
                    style={{
                      default: {
                        fill:
                          selectedState === state
                            ? "#2563eb"
                            : "#E2E8F0",
                        outline: "none",
                      },
                      hover: {
                        fill: "#60A5FA",
                        outline: "none",
                        cursor: "pointer",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* 🔥 INFO PANEL */}
      {selectedState && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            background: "#f1f5f9",
            borderRadius: "10px",
          }}
        >
          <h2>{selectedState}</h2>

          <p><strong>Senators:</strong></p>
          <ul>
            <li>Senator 1</li>
            <li>Senator 2</li>
          </ul>

          <p><strong>House Representative:</strong></p>
          <ul>
            <li>Representative Name</li>
          </ul>
        </div>
      )}
    </div>
  );
}
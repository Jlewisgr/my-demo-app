"use client";

import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";

import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// 🔥 State GeoJSON
const stateGeoUrl =
  "https://unpkg.com/us-atlas@3/states-10m.json";

// 🔥 Congressional districts
const districtGeoUrl =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/congress-118.json";

// 🔥 VERY basic zip → state (expand later)
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
  const [inputZip, setInputZip] = useState("");

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
          if (state) setSelectedState(state);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadUser();
  }, []);

  // 🔥 Search ZIP manually
  const handleSearch = () => {
    const state = zipToState(inputZip);

    if (state) {
      setSelectedState(state);
      setZipcode(inputZip);
    } else {
      alert("ZIP not supported yet (we’ll expand soon)");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Find Your Representatives</h1>

      {/* 🔍 ZIP SEARCH */}
      <div style={{ marginTop: "20px" }}>
        <input
          value={inputZip}
          onChange={(e) => setInputZip(e.target.value)}
          placeholder="Enter ZIP code"
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginRight: "10px"
          }}
        />

        <button onClick={handleSearch}>
          Search
        </button>
      </div>

      {zipcode && (
        <p style={{ marginTop: "10px" }}>
          Current ZIP: {zipcode}
        </p>
      )}

      {/* 🗺️ MAP */}
      <div style={{ width: "100%", height: "500px", marginTop: "20px" }}>
        <ComposableMap
          projection="geoAlbersUsa"
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup center={[-97, 38]} zoom={selectedState ? 2 : 1}>

            {/* STATES */}
            <Geographies geography={stateGeoUrl}>
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
                          outline: "none"
                        },
                        hover: {
                          fill: "#60A5FA",
                          outline: "none",
                          cursor: "pointer"
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* DISTRICTS OVERLAY */}
            <Geographies geography={districtGeoUrl}>
              {({ geographies }: any) =>
                geographies.map((geo: any) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill: "transparent",
                        stroke: "#444",
                        strokeWidth: 0.3
                      }
                    }}
                  />
                ))
              }
            </Geographies>

          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* INFO PANEL */}
      {selectedState && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            background: "#f1f5f9",
            borderRadius: "10px"
          }}
        >
          <h2>{selectedState}</h2>

          <p><strong>Senators:</strong></p>
          <ul>
            <li>Coming soon</li>
            <li>Coming soon</li>
          </ul>

          <p><strong>House Representative:</strong></p>
          <ul>
            <li>Coming soon</li>
          </ul>
        </div>
      )}
    </div>
  );
}
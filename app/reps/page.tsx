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

// 🌎 State GeoJSON
const stateGeoUrl =
  "https://unpkg.com/us-atlas@3/states-10m.json";

// 🏛️ Congressional districts
const districtGeoUrl =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/congress-118.json";

// 🔥 ZIP → STATE (basic for now)
const zipToState = (zip: string) => {
  const num = parseInt(zip);

  if (num >= 85000 && num <= 86999) return "Arizona";
  if (num >= 90000 && num <= 96162) return "California";
  if (num >= 10000 && num <= 14999) return "New York";

  return null;
};

// 📍 STATE → MAP CENTER
const stateCenters: Record<string, [number, number]> = {
  Arizona: [-111.7, 34.3],
  California: [-119.4, 36.8],
  "New York": [-75.5, 43]
};

export default function RepsPage() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [zipcode, setZipcode] = useState<string>("");

  // 🔥 Load ZIP from Firebase → set state
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

  // 🔥 Determine map center + zoom
  const mapCenter =
    selectedState && stateCenters[selectedState]
      ? stateCenters[selectedState]
      : [-97, 38];

  const mapZoom = selectedState ? 4 : 1;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Find Your Representatives</h1>

      {zipcode && (
        <p style={{ marginTop: "10px" }}>
          Home ZIP: {zipcode}
        </p>
      )}

      {/* 🗺️ MAP */}
      <div style={{ width: "100%", height: "500px", marginTop: "20px" }}>
        <ComposableMap
          projection="geoAlbersUsa"
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup center={mapCenter} zoom={mapZoom}>
            
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

            {/* DISTRICTS */}
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
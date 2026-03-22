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

const geoUrl = "/data/districts.geojson";

export default function RepsPage() {
  const [coords, setCoords] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);

  // 🔥 Load user address → geocode
  useEffect(() => {
    const loadUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
          const addr = snap.data().address;
          if (!addr) return;

          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`
          );

          const data = await res.json();

          if (data.length > 0) {
            setCoords({
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon)
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadUser();
  }, []);

  // 📍 Map positioning
  const mapCenter = coords
    ? [coords.lng, coords.lat]
    : [-97, 38];

  const mapZoom = coords ? 5 : 1;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Congressional Districts</h1>

      <div style={{ width: "100%", height: "600px" }}>
        <ComposableMap
          projection="geoAlbersUsa"
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup center={mapCenter} zoom={mapZoom}>

            {/* 🔥 DISTRICTS */}
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any, i: number) => {
                  const isSelected =
                    selectedDistrict &&
                    geo.properties?.GEOID === selectedDistrict?.GEOID;

                  // 🎨 alternating colors for separation
                  const baseColor =
                    i % 2 === 0
                      ? "rgba(59,130,246,0.25)"  // blue
                      : "rgba(16,185,129,0.25)"; // green

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => setSelectedDistrict(geo.properties)}
                      style={{
                        default: {
                          fill: isSelected ? "#1d4ed8" : baseColor,
                          stroke: "#0f172a",
                          strokeWidth: 0.8,
                          outline: "none"
                        },
                        hover: {
                          fill: "#f59e0b", // 🔥 orange hover
                          stroke: "#000",
                          strokeWidth: 1.2,
                          outline: "none",
                          cursor: "pointer"
                        },
                        pressed: {
                          fill: "#dc2626"
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>

          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* 🏛️ Selected district info */}
      {selectedDistrict && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            background: "#f1f5f9",
            borderRadius: "10px"
          }}
        >
          <h2>Selected District</h2>
          <p><strong>GEOID:</strong> {selectedDistrict.GEOID}</p>
        </div>
      )}
    </div>
  );
}
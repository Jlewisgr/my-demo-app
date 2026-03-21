"use client";

import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";

import * as turf from "@turf/turf";

import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// 🌎 US States
const stateGeoUrl =
  "https://unpkg.com/us-atlas@3/states-10m.json";

// 🏛️ Congressional districts
const districtGeoUrl =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/congress-118.json";

export default function RepsPage() {
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<any>(null);
  const [districts, setDistricts] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);

  // 🔥 Load district shapes
  useEffect(() => {
    fetch(districtGeoUrl)
      .then((res) => res.json())
      .then((data) => setDistricts(data));
  }, []);

  // 🔥 Load user address → geocode → find district
  useEffect(() => {
    const loadUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
          const addr = snap.data().address;
          setAddress(addr);

          if (!addr) return;

          // 🌍 Geocode address
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`
          );

          const data = await res.json();

          if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);

            setCoords({ lat, lng });

            // 🏛️ Find district
            if (districts) {
              const point = turf.point([lng, lat]);

              for (let geo of districts.features) {
                if (turf.booleanPointInPolygon(point, geo)) {
                  setSelectedDistrict(geo.properties);
                  break;
                }
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadUser();
  }, [districts]);

  // 🔥 Map center logic
  const mapCenter = coords
    ? [coords.lng, coords.lat]
    : [-97, 38];

  const mapZoom = coords ? 6 : 1;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Find Your Representatives</h1>

      {address && (
        <p style={{ marginTop: "10px" }}>
          Home Address: {address}
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
                geographies.map((geo: any) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill: "#E2E8F0",
                        outline: "none"
                      },
                      hover: {
                        fill: "#60A5FA",
                        outline: "none"
                      }
                    }}
                  />
                ))
              }
            </Geographies>

            {/* DISTRICTS */}
            <Geographies geography={districtGeoUrl}>
              {({ geographies }: any) =>
                geographies.map((geo: any) => {
                  const isSelected =
                    selectedDistrict &&
                    geo.properties?.GEOID === selectedDistrict?.GEOID;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: isSelected ? "#2563eb" : "transparent",
                          stroke: "#444",
                          strokeWidth: isSelected ? 1 : 0.3
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

      {/* 🏛️ DISTRICT INFO */}
      {selectedDistrict && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            background: "#f1f5f9",
            borderRadius: "10px"
          }}
        >
          <h2>Congressional District</h2>
          <p>
            {selectedDistrict.name || selectedDistrict.GEOID}
          </p>

          <p><strong>Representative:</strong> Coming soon</p>
        </div>
      )}
    </div>
  );
}
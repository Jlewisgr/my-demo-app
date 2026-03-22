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

const geoUrl = "/data/districts.json";

export default function RepsPage() {
  const [coords, setCoords] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);

  // 🔥 Load user location
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

  const mapCenter = coords
    ? [coords.lng, coords.lat]
    : [-97, 38];

  const mapZoom = coords ? 5 : 1;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Congressional Districts</h1>

      <div style={{ width: "100%", height: "600px" }}>
        <ComposableMap projection="geoAlbersUsa">
          <ZoomableGroup center={mapCenter} zoom={mapZoom}>

            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any) => {
                  const isSelected =
                    selectedDistrict &&
                    geo.properties?.GEOID === selectedDistrict?.GEOID;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => setSelectedDistrict(geo.properties)}
                      style={{
                        default: {
                          fill: isSelected
                            ? "#2563eb"
                            : "rgba(59,130,246,0.15)",
                          stroke: "#1e293b",
                          strokeWidth: 0.5
                        },
                        hover: {
                          fill: "#60A5FA",
                          cursor: "pointer"
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

      {selectedDistrict && (
        <div style={{ marginTop: "20px" }}>
          <h2>District</h2>
          <p>{selectedDistrict.GEOID}</p>
        </div>
      )}
    </div>
  );
}
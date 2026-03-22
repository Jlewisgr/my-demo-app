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

const districtGeoUrl = "/data/districts.geojson";

export default function RepsPage() {
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);

  // 🔥 Load user address + geocode (simple version)
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

          // simple geocode
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`
          );

          const data = await res.json();

          if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);

            setCoords({ lat, lng });
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

  const mapZoom = coords ? 6 : 1;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Find Your Representatives</h1>

      {address && <p>Home Address: {address}</p>}

      {/* 🗺️ MAP */}
      <div style={{ width: "100%", height: "500px", marginTop: "20px" }}>
        <ComposableMap
          projection="geoAlbersUsa"
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup center={mapCenter} zoom={mapZoom}>

            {/* 🔥 DISTRICTS (CLEAN GEOJSON) */}
            <Geographies geography={districtGeoUrl}>
              {({ geographies }: any) =>
                geographies.map((geo: any) => {
                  const isSelected =
                    selectedDistrict &&
                    geo.properties?.district === selectedDistrict?.district;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => setSelectedDistrict(geo.properties)}
                      style={{
                        default: {
                          fill: isSelected
                            ? "#2563eb"
                            : "rgba(37,99,235,0.15)",
                          stroke: "#1e293b",
                          strokeWidth: 0.6
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

      {/* INFO */}
      {selectedDistrict && (
        <div style={{ marginTop: "20px" }}>
          <h2>District</h2>
          <p>{selectedDistrict.district}</p>
        </div>
      )}
    </div>
  );
}
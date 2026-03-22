"use client";


import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";

import * as turf from "@turf/turf";
import { feature } from "topojson-client";

import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const stateGeoUrl =
  "https://unpkg.com/us-atlas@3/states-10m.json";

const districtTopoUrl =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/congress-118.json";

export default function RepsPage() {
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<any>(null);
  const [districts, setDistricts] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);

  // 🔥 Convert TopoJSON → GeoJSON
  useEffect(() => {
    fetch(districtTopoUrl)
      .then((res) => res.json())
      .then((topology) => {
        const geo = feature(
          topology,
          topology.objects.districts
        );
        setDistricts(geo);
      });
  }, []);

  // 🔥 Load user → geocode → find district
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

          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`
          );

          const data = await res.json();

          if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);

            setCoords({ lat, lng });

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

  const mapCenter = coords
    ? [coords.lng, coords.lat]
    : [-97, 38];

  const mapZoom = selectedDistrict ? 8 : coords ? 6 : 1;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Find Your Representatives</h1>

      {address && (
        <p style={{ marginTop: "10px" }}>
          Home Address: {address}
        </p>
      )}

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
                        fill: "#f1f5f9",
                        outline: "none"
                      }
                    }}
                  />
                ))
              }
            </Geographies>

            {/* 🔥 REAL DISTRICTS */}
            {districts && (
              <Geographies geography={districts}>
                {({ geographies }: any) =>
                  geographies.map((geo: any) => {
                    const isSelected =
                      selectedDistrict &&
                      geo.properties.GEOID === selectedDistrict.GEOID;

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
                            strokeWidth: isSelected ? 2 : 0.5
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
            )}

          </ZoomableGroup>
        </ComposableMap>
      </div>

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
          <p>{selectedDistrict.GEOID}</p>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export default function RepsPage() {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Find Your Representatives</h1>

      {/* MAP */}
      <ComposableMap projection="geoAlbersUsa">
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

      {/* INFO PANEL */}
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

          {/* 🔥 Mock data (we'll replace later) */}
          <p>Senators:</p>
          <ul>
            <li>Senator 1 (Party)</li>
            <li>Senator 2 (Party)</li>
          </ul>

          <p>House Representative:</p>
          <ul>
            <li>Representative Name</li>
          </ul>
        </div>
      )}
    </div>
  );
}
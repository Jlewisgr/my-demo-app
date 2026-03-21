"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const stateGeoUrl = "https://unpkg.com/us-atlas@3/states-10m.json";

type StateView = {
  name: string;
  center: [number, number];
  zoom: number;
};

// Basic state zoom presets
const STATE_VIEWS: Record<string, StateView> = {
  Alabama: { name: "Alabama", center: [-86.8, 32.8], zoom: 4 },
  Alaska: { name: "Alaska", center: [-152, 64], zoom: 2.2 },
  Arizona: { name: "Arizona", center: [-111.7, 34.2], zoom: 4.2 },
  Arkansas: { name: "Arkansas", center: [-92.3, 34.8], zoom: 4.5 },
  California: { name: "California", center: [-119.5, 37.1], zoom: 3.5 },
  Colorado: { name: "Colorado", center: [-105.5, 39], zoom: 4.5 },
  Connecticut: { name: "Connecticut", center: [-72.7, 41.6], zoom: 7 },
  Delaware: { name: "Delaware", center: [-75.5, 39], zoom: 8 },
  Florida: { name: "Florida", center: [-81.7, 27.8], zoom: 3.7 },
  Georgia: { name: "Georgia", center: [-83.5, 32.7], zoom: 4.2 },
  Hawaii: { name: "Hawaii", center: [-157.5, 20.8], zoom: 5.5 },
  Idaho: { name: "Idaho", center: [-114.4, 44.2], zoom: 4.2 },
  Illinois: { name: "Illinois", center: [-89.2, 40], zoom: 4.3 },
  Indiana: { name: "Indiana", center: [-86.1, 39.9], zoom: 5 },
  Iowa: { name: "Iowa", center: [-93.5, 42.1], zoom: 5 },
  Kansas: { name: "Kansas", center: [-98.2, 38.5], zoom: 4.7 },
  Kentucky: { name: "Kentucky", center: [-84.9, 37.8], zoom: 4.8 },
  Louisiana: { name: "Louisiana", center: [-91.8, 30.9], zoom: 4.7 },
  Maine: { name: "Maine", center: [-69, 45.2], zoom: 4.8 },
  Maryland: { name: "Maryland", center: [-76.7, 39], zoom: 6.3 },
  Massachusetts: { name: "Massachusetts", center: [-71.8, 42.3], zoom: 6.3 },
  Michigan: { name: "Michigan", center: [-84.7, 44.3], zoom: 4.2 },
  Minnesota: { name: "Minnesota", center: [-94.5, 46.3], zoom: 4.2 },
  Mississippi: { name: "Mississippi", center: [-89.7, 32.7], zoom: 4.8 },
  Missouri: { name: "Missouri", center: [-92.5, 38.5], zoom: 4.6 },
  Montana: { name: "Montana", center: [-110.5, 47], zoom: 3.8 },
  Nebraska: { name: "Nebraska", center: [-99.7, 41.5], zoom: 4.4 },
  Nevada: { name: "Nevada", center: [-116.7, 39.3], zoom: 4.2 },
  "New Hampshire": { name: "New Hampshire", center: [-71.6, 43.8], zoom: 6.2 },
  "New Jersey": { name: "New Jersey", center: [-74.5, 40.1], zoom: 6.8 },
  "New Mexico": { name: "New Mexico", center: [-106.1, 34.5], zoom: 4.2 },
  "New York": { name: "New York", center: [-75, 42.9], zoom: 4 },
  "North Carolina": { name: "North Carolina", center: [-79.4, 35.5], zoom: 4.5 },
  "North Dakota": { name: "North Dakota", center: [-100.5, 47.5], zoom: 4.5 },
  Ohio: { name: "Ohio", center: [-82.8, 40.3], zoom: 4.8 },
  Oklahoma: { name: "Oklahoma", center: [-97.5, 35.6], zoom: 4.7 },
  Oregon: { name: "Oregon", center: [-120.5, 44], zoom: 4.2 },
  Pennsylvania: { name: "Pennsylvania", center: [-77.7, 41], zoom: 4.6 },
  "Rhode Island": { name: "Rhode Island", center: [-71.5, 41.7], zoom: 8.5 },
  "South Carolina": { name: "South Carolina", center: [-80.9, 33.8], zoom: 4.8 },
  "South Dakota": { name: "South Dakota", center: [-100, 44.5], zoom: 4.5 },
  Tennessee: { name: "Tennessee", center: [-86.4, 35.8], zoom: 4.7 },
  Texas: { name: "Texas", center: [-99.4, 31], zoom: 3.5 },
  Utah: { name: "Utah", center: [-111.7, 39.3], zoom: 4.5 },
  Vermont: { name: "Vermont", center: [-72.7, 44.1], zoom: 6.5 },
  Virginia: { name: "Virginia", center: [-78.7, 37.5], zoom: 4.6 },
  Washington: { name: "Washington", center: [-120.7, 47.4], zoom: 4.2 },
  "West Virginia": { name: "West Virginia", center: [-80.6, 38.6], zoom: 5.1 },
  Wisconsin: { name: "Wisconsin", center: [-89.9, 44.6], zoom: 4.5 },
  Wyoming: { name: "Wyoming", center: [-107.5, 43], zoom: 4.7 },
  "District of Columbia": { name: "District of Columbia", center: [-77.0369, 38.9072], zoom: 9 },
};

const ZIP_RANGES: Array<{ min: number; max: number; state: string }> = [
  { min: 35000, max: 36999, state: "Alabama" },
  { min: 99500, max: 99999, state: "Alaska" },
  { min: 85000, max: 86999, state: "Arizona" },
  { min: 71600, max: 72999, state: "Arkansas" },
  { min: 90000, max: 96199, state: "California" },
  { min: 80000, max: 81699, state: "Colorado" },
  { min: 6000, max: 6999, state: "Connecticut" },
  { min: 19700, max: 19999, state: "Delaware" },
  { min: 32000, max: 34999, state: "Florida" },
  { min: 30000, max: 31999, state: "Georgia" },
  { min: 96700, max: 96999, state: "Hawaii" },
  { min: 83200, max: 83899, state: "Idaho" },
  { min: 60000, max: 62999, state: "Illinois" },
  { min: 46000, max: 47999, state: "Indiana" },
  { min: 50000, max: 52899, state: "Iowa" },
  { min: 66000, max: 67999, state: "Kansas" },
  { min: 40000, max: 42799, state: "Kentucky" },
  { min: 70000, max: 71499, state: "Louisiana" },
  { min: 3900, max: 4999, state: "Maine" },
  { min: 20600, max: 21999, state: "Maryland" },
  { min: 1000, max: 2799, state: "Massachusetts" },
  { min: 48000, max: 49999, state: "Michigan" },
  { min: 55000, max: 56799, state: "Minnesota" },
  { min: 38600, max: 39799, state: "Mississippi" },
  { min: 63000, max: 65899, state: "Missouri" },
  { min: 59000, max: 59999, state: "Montana" },
  { min: 68000, max: 69399, state: "Nebraska" },
  { min: 88900, max: 89899, state: "Nevada" },
  { min: 3000, max: 3899, state: "New Hampshire" },
  { min: 7000, max: 8999, state: "New Jersey" },
  { min: 87000, max: 88499, state: "New Mexico" },
  { min: 10000, max: 14999, state: "New York" },
  { min: 27000, max: 28999, state: "North Carolina" },
  { min: 58000, max: 58899, state: "North Dakota" },
  { min: 43000, max: 45999, state: "Ohio" },
  { min: 73000, max: 74999, state: "Oklahoma" },
  { min: 97000, max: 97999, state: "Oregon" },
  { min: 15000, max: 19699, state: "Pennsylvania" },
  { min: 2800, max: 2999, state: "Rhode Island" },
  { min: 29000, max: 29999, state: "South Carolina" },
  { min: 57000, max: 57799, state: "South Dakota" },
  { min: 37000, max: 38599, state: "Tennessee" },
  { min: 75000, max: 79999, state: "Texas" },
  { min: 84000, max: 84799, state: "Utah" },
  { min: 5000, max: 5999, state: "Vermont" },
  { min: 20100, max: 24699, state: "Virginia" },
  { min: 98000, max: 99499, state: "Washington" },
  { min: 24700, max: 26899, state: "West Virginia" },
  { min: 53000, max: 54999, state: "Wisconsin" },
  { min: 82000, max: 83199, state: "Wyoming" },
  { min: 20000, max: 20599, state: "District of Columbia" },
];

function zipToState(zip: string): string | null {
  if (!/^\d{5}$/.test(zip)) return null;
  const num = Number(zip);
  const match = ZIP_RANGES.find((r) => num >= r.min && num <= r.max);
  return match ? match.state : null;
}

export default function RepsPage() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [savedZip, setSavedZip] = useState("");
  const [inputZip, setInputZip] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSavedZip = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists()) return;

        const zip = (snap.data().zipcode || "").trim();
        if (!zip) return;

        setSavedZip(zip);
        setInputZip(zip);

        const state = zipToState(zip);
        if (state) {
          setSelectedState(state);
          setMessage(`Started on your saved ZIP: ${zip}`);
        } else {
          setMessage("Your saved ZIP is present, but state detection for it is not set yet.");
        }
      } catch (err) {
        console.error("Failed to load saved ZIP:", err);
        setMessage("Could not load your saved ZIP.");
      }
    };

    loadSavedZip();
  }, []);

  const view = useMemo(() => {
    if (!selectedState || !STATE_VIEWS[selectedState]) {
      return { center: [-96, 39] as [number, number], zoom: 1 };
    }
    return {
      center: STATE_VIEWS[selectedState].center,
      zoom: STATE_VIEWS[selectedState].zoom,
    };
  }, [selectedState]);

  const handleZipSearch = () => {
    const zip = inputZip.trim();
    const state = zipToState(zip);

    if (!state) {
      setMessage("That ZIP is not supported in this version yet.");
      return;
    }

    setSavedZip(zip);
    setSelectedState(state);
    setMessage(
      `Showing ${state} for ZIP ${zip}. Exact congressional district needs a full street address, not just ZIP.`
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Find Your Representatives</h1>

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          value={inputZip}
          onChange={(e) => setInputZip(e.target.value)}
          placeholder="Enter any 5-digit ZIP code"
          maxLength={5}
          style={{
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            minWidth: "220px",
          }}
        />
        <button
          onClick={handleZipSearch}
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          Search ZIP
        </button>
      </div>

      <div style={{ marginTop: "12px", color: "#334155" }}>
        {savedZip && <div><strong>Home ZIP:</strong> {savedZip}</div>}
        {selectedState && <div><strong>Selected state:</strong> {selectedState}</div>}
        {message && <div style={{ marginTop: "6px" }}>{message}</div>}
      </div>

      <div
        style={{
          width: "100%",
          height: "560px",
          marginTop: "20px",
          background: "#fff",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <ComposableMap
          projection="geoAlbersUsa"
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup center={view.center} zoom={view.zoom} maxZoom={10}>
            <Geographies geography={stateGeoUrl}>
              {({ geographies }: any) =>
                geographies.map((geo: any) => {
                  const stateName = geo.properties.name;
                  const active = selectedState === stateName;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => {
                        setSelectedState(stateName);
                        setMessage(`Showing ${stateName}.`);
                      }}
                      style={{
                        default: {
                          fill: active ? "#2563eb" : "#E2E8F0",
                          stroke: "#94a3b8",
                          strokeWidth: 0.6,
                          outline: "none",
                        },
                        hover: {
                          fill: "#60A5FA",
                          stroke: "#64748b",
                          strokeWidth: 0.8,
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: "#1d4ed8",
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {selectedState && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            background: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h2 style={{ marginTop: 0 }}>{selectedState}</h2>
          
        </div>
      )}
    </div>
  );
}
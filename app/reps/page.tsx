"use client";

import { useState } from "react";

export default function RepsPage() {
  const [zip, setZip] = useState("");
  const [rep, setRep] = useState<any>(null);

  const handleSearch = () => {
    setRep({
      name: "Jane Doe",
      party: "Independent",
      stance: "Against Housing Bill",
    });
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Find Your Representative</h1>

      <input
        placeholder="Enter ZIP code"
        value={zip}
        onChange={(e) => setZip(e.target.value)}
        style={{ padding: "10px", marginRight: "10px" }}
      />

      <button onClick={handleSearch}>Search</button>

      {rep && (
        <div style={{ marginTop: "20px" }}>
          <h3>{rep.name}</h3>
          <p>{rep.party}</p>
          <p>{rep.stance}</p>
        </div>
      )}
    </div>
  );
}
"use client";

// import { useEffect, useState } from "react";
// import { db, auth } from "@/lib/firebase";
// import { doc, getDoc } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth";

// ── Arizona representatives (hardcoded for now) ──────────────────────────────
// TODO: replace with live data from Google Civic API or MCP server
// const fetchReps = async (zipCode: string) => { ... }

const ARIZONA_REPS = {
  state: "Arizona",
  senators: [
    {
      name: "Mark Kelly",
      party: "Democrat",
      role: "U.S. Senator",
      phone: "(202) 224-2235",
      website: "https://www.kelly.senate.gov",
      since: "2020",
    },
    {
      name: "Ruben Gallego",
      party: "Democrat",
      role: "U.S. Senator",
      phone: "(202) 224-4521",
      website: "https://www.gallego.senate.gov",
      since: "2025",
    },
  ],
  houseReps: [
    {
      name: "David Schweikert",
      party: "Republican",
      role: "U.S. Representative · District 1",
      phone: "(202) 225-2190",
      website: "https://schweikert.house.gov",
      since: "2011",
    },
    {
      name: "Eli Crane",
      party: "Republican",
      role: "U.S. Representative · District 2",
      phone: "(202) 225-3361",
      website: "https://crane.house.gov",
      since: "2023",
    },
    {
      name: "Yassamin Ansari",
      party: "Democrat",
      role: "U.S. Representative · District 3",
      phone: "(202) 225-4065",
      website: "https://ansari.house.gov",
      since: "2025",
    },
    {
      name: "Greg Stanton",
      party: "Democrat",
      role: "U.S. Representative · District 4",
      phone: "(202) 225-9888",
      website: "https://stanton.house.gov",
      since: "2019",
    },
    {
      name: "Andy Biggs",
      party: "Republican",
      role: "U.S. Representative · District 5",
      phone: "(202) 225-2635",
      website: "https://biggs.house.gov",
      since: "2017",
    },
    {
      name: "Juan Ciscomani",
      party: "Republican",
      role: "U.S. Representative · District 6",
      phone: "(202) 225-2542",
      website: "https://ciscomani.house.gov",
      since: "2023",
    },
    {
      name: "Raúl Grijalva",
      party: "Democrat",
      role: "U.S. Representative · District 7",
      phone: "(202) 225-2435",
      website: "https://grijalva.house.gov",
      since: "2003",
    },
    {
      name: "Debbie Lesko",
      party: "Republican",
      role: "U.S. Representative · District 8",
      phone: "(202) 225-4576",
      website: "https://lesko.house.gov",
      since: "2018",
    },
    {
      name: "Paul Gosar",
      party: "Republican",
      role: "U.S. Representative · District 9",
      phone: "(202) 225-2315",
      website: "https://gosar.house.gov",
      since: "2011",
    },
  ],
};

type Rep = {
  name: string;
  party: string;
  role: string;
  phone: string;
  website: string;
  since: string;
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}

function RepCard({ rep }: { rep: Rep }) {
  const isDem = rep.party === "Democrat";
  const avatarBg = isDem ? "rgba(37,99,235,0.15)" : "rgba(220,38,38,0.15)";
  const avatarColor = isDem ? "#93b4f7" : "#f7a0a0";
  const partyBg = isDem ? "rgba(37,99,235,0.12)" : "rgba(220,38,38,0.12)";
  const partyColor = isDem ? "#93b4f7" : "#f7a0a0";
  const partyBorder = isDem ? "rgba(37,99,235,0.25)" : "rgba(220,38,38,0.25)";

  return (
    <div style={{
      background: "#111827",
      border: "1px solid #1f2d3d",
      borderRadius: "14px",
      padding: "18px 20px",
      transition: "border-color 0.2s",
      position: "relative",
      overflow: "hidden",
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "#c9a84c44")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "#1f2d3d")}
    >
      {/* subtle gold top accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: "2px",
        background: isDem
          ? "linear-gradient(90deg, transparent, #2563eb44, transparent)"
          : "linear-gradient(90deg, transparent, #dc262644, transparent)",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
        {/* avatar */}
        <div style={{
          width: "44px", height: "44px", borderRadius: "10px",
          background: avatarBg, color: avatarColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700, fontSize: "14px", flexShrink: 0,
        }}>
          {getInitials(rep.name)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "16px", fontWeight: 700,
              color: "#f0ead6", margin: 0,
            }}>{rep.name}</h3>
            <span style={{
              fontSize: "10px", fontWeight: 500,
              background: partyBg, color: partyColor,
              border: `1px solid ${partyBorder}`,
              padding: "2px 8px", borderRadius: "20px",
            }}>{rep.party}</span>
          </div>
          <p style={{ fontSize: "12px", color: "#4a6080", margin: "3px 0 0", fontFamily: "'DM Sans', sans-serif" }}>
            {rep.role} · Since {rep.since}
          </p>
        </div>
      </div>

      <div style={{
        borderTop: "1px solid #1f2d3d", paddingTop: "12px",
        display: "flex", gap: "16px", flexWrap: "wrap",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <a href={`tel:${rep.phone}`} style={{
          fontSize: "12px", color: "#6b7a8d", textDecoration: "none",
          display: "flex", alignItems: "center", gap: "5px",
        }}>
          <span style={{ fontSize: "13px" }}>📞</span> {rep.phone}
        </a>
        <a href={rep.website} target="_blank" rel="noopener noreferrer" style={{
          fontSize: "12px", color: "#c9a84c", textDecoration: "none",
          display: "flex", alignItems: "center", gap: "4px", fontWeight: 500,
        }}>
          Visit website <span>→</span>
        </a>
      </div>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "36px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "20px", fontWeight: 700,
          color: "#f0ead6", margin: 0,
        }}>{title}</h2>
        <span style={{
          fontSize: "11px", fontWeight: 500,
          background: "rgba(201,168,76,0.1)",
          color: "#c9a84c",
          border: "1px solid rgba(201,168,76,0.2)",
          padding: "2px 8px", borderRadius: "20px",
        }}>{count}</span>
      </div>
      {children}
    </div>
  );
}

export default function RepsPage() {
  // const [userZip, setUserZip] = useState("");
  // const [loading, setLoading] = useState(true);
  //
  // useEffect(() => {
  //   const unsub = onAuthStateChanged(auth, async (user) => {
  //     if (!user) { setLoading(false); return; }
  //     const snap = await getDoc(doc(db, "users", user.uid));
  //     if (snap.exists()) setUserZip(snap.data().zip ?? "");
  //     setLoading(false);
  //   });
  //   return () => unsub();
  // }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { background: #0d1117; }
      `}</style>

      <main style={{
        minHeight: "100vh",
        background: "#0d1117",
        padding: "32px 24px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>

          {/* HEADER */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "linear-gradient(135deg, #c9a84c, #e8c96d)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px",
              }}>🏛️</div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px", fontWeight: 700,
                color: "#f0ead6", margin: 0,
              }}>Arizona Representatives</h1>
            </div>
            <p style={{ color: "#4a6080", fontSize: "14px", margin: "0 0 0 52px" }}>
              Federal delegation · 119th Congress · All data presented neutrally
            </p>
          </div>

          {/* STATE BADGE */}
          <div style={{
            background: "#111827",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}>
            <span style={{ fontSize: "28px" }}>🌵</span>
            <div>
              <p style={{ fontSize: "12px", color: "#4a6080", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.8px" }}>State</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#f0ead6", margin: 0, fontWeight: 700 }}>
                Arizona · AZ
              </p>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <p style={{ fontSize: "12px", color: "#4a6080", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Total</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#c9a84c", margin: 0, fontWeight: 700 }}>
                {ARIZONA_REPS.senators.length + ARIZONA_REPS.houseReps.length} reps
              </p>
            </div>
          </div>

          {/* SENATORS */}
          <Section title="U.S. Senators" count={ARIZONA_REPS.senators.length}>
            <div style={{ display: "grid", gap: "12px" }}>
              {ARIZONA_REPS.senators.map((rep) => (
                <RepCard key={rep.name} rep={rep} />
              ))}
            </div>
          </Section>

          {/* HOUSE REPS */}
          <Section title="U.S. House Representatives" count={ARIZONA_REPS.houseReps.length}>
            <div style={{ display: "grid", gap: "12px" }}>
              {ARIZONA_REPS.houseReps.map((rep) => (
                <RepCard key={rep.name} rep={rep} />
              ))}
            </div>
          </Section>

          <p style={{ fontSize: "11px", color: "#2a3a50", textAlign: "center", marginTop: "8px" }}>
            {/* TODO: replace hardcoded data with live Google Civic API or MCP lookup */}
            Data is hardcoded for demo · Live lookup coming soon
          </p>
        </div>
      </main>
    </>
  );
}
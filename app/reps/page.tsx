"use client";

export default function RepsPage() {
  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      {/* HEADER */}
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "10px" }}>
        Your Representatives
      </h1>

      <p style={{ color: "#64748b", marginBottom: "24px" }}>
        Based on your saved address
      </p>

      {/* DISTRICT INFO */}
      <div
        style={{
          background: "#f1f5f9",
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "24px"
        }}
      >
        <h2 style={{ marginBottom: "8px" }}>Congressional District</h2>
        <p style={{ fontSize: "18px", fontWeight: "600" }}>
          Arizona District 5
        </p>
      </div>

      {/* HOUSE REPRESENTATIVE */}
      <Section title="House Representative">
        <RepCard
          name="John Doe"
          party="Republican"
          phone="(202) 225-1234"
          website="#"
        />
      </Section>

      {/* SENATORS */}
      <Section title="Senators">
        <div style={{ display: "grid", gap: "16px" }}>
          <RepCard
            name="Jane Smith"
            party="Democrat"
            phone="(202) 224-5678"
            website="#"
          />
          <RepCard
            name="Michael Johnson"
            party="Republican"
            phone="(202) 224-9999"
            website="#"
          />
        </div>
      </Section>
    </div>
  );
}

/* 🔹 SECTION WRAPPER */
function Section({ title, children }: any) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <h2 style={{ marginBottom: "12px", fontSize: "20px" }}>{title}</h2>
      {children}
    </div>
  );
}

/* 🔹 REPRESENTATIVE CARD */
function RepCard({ name, party, phone, website }: any) {
  const partyColor =
    party === "Democrat"
      ? "#2563eb"
      : party === "Republican"
      ? "#dc2626"
      : "#64748b";

  return (
    <div
      style={{
        background: "white",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
      }}
    >
      {/* NAME + PARTY */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600" }}>{name}</h3>

        <span
          style={{
            background: partyColor,
            color: "white",
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "12px"
          }}
        >
          {party}
        </span>
      </div>

      {/* CONTACT INFO */}
      <div style={{ marginTop: "10px", color: "#475569" }}>
        <p>📞 {phone}</p>

        <a
          href={website}
          style={{
            color: "#2563eb",
            textDecoration: "none",
            fontWeight: "500"
          }}
        >
          Visit Website →
        </a>
      </div>
    </div>
  );
}
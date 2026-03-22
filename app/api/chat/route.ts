import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("API route hit, sending to Anthropic...");

    const apiKey = process.env.ANTHROPIC_API_KEY as string;
    console.log("API key exists:", !!apiKey);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("Anthropic response status:", response.status);
    console.log("Anthropic response:", JSON.stringify(data));

    return NextResponse.json(data);
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
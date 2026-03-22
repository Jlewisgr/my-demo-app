import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY as string;
    const mcpToken = process.env.MCP_AUTH_TOKEN as string;

    console.log("=== CHAT REQUEST ===");
    console.log("API key exists:", !!apiKey);
    console.log("MCP token exists:", !!mcpToken);
    console.log("MCP token preview:", mcpToken?.substring(0, 20));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: AbortSignal.timeout(55000),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "mcp-client-2025-04-04",
      },
      body: JSON.stringify({
        ...body,
        mcp_servers: [
          {
            type: "url",
            url: "https://politicsmdpserver-production.up.railway.app/sse",
            name: "civics",
            authorization_token: mcpToken,
          },
        ],
      }),
    });

    console.log("Anthropic status:", response.status);
    const data = await response.json();
    console.log("Anthropic response:", JSON.stringify(data).substring(0, 300));

    return NextResponse.json(data);
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
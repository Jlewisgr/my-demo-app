import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY as string;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "mcp-client-2025-11-20",
      },
      body: JSON.stringify({
        ...body,
        mcp_servers: [
          {
            type: "url",
            url: "https://politicsmdpserver-production.up.railway.app/sse",
            name: "civics",
            authorization_token: process.env.MCP_AUTH_TOKEN,
          }
        ],
        tools: [
          {
            type: "mcp_toolset",
            mcp_server_name: "civics",
          }
        ],
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
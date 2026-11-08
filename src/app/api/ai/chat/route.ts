import { NextResponse } from "next/server";
import { aiChat, type ChatMessage } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = body?.messages as ChatMessage[];
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }
    const sanitized = messages
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
    if (!sanitized.length) {
      return NextResponse.json({ error: "no valid messages" }, { status: 400 });
    }
    const provider = body?.provider;
    const model = body?.model;
    const result = await aiChat(sanitized, { provider, model });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ai/chat]", error);
    return NextResponse.json(
      { reply: "Something glitched on my side — try once more, or browse /shop directly.", source: "local" },
      { status: 200 }
    );
  }
}

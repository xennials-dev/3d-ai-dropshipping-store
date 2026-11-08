import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const value = String(email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }
    try {
      await db.insert(subscribers).values({ email: value });
      return NextResponse.json({
        message: "Welcome to the Vendora list — your LAUNCH20 code is on its way.",
      });
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === "23505") {
        return NextResponse.json({
          message: "You’re already on the list — LAUNCH20 is yours.",
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("[newsletter]", error);
    return NextResponse.json({ message: "Something went wrong — try again." }, { status: 500 });
  }
}

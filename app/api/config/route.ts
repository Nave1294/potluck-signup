import { NextResponse } from "next/server";
import { readConfig, writeConfig } from "@/lib/db";

export async function GET() {
  return NextResponse.json(readConfig());
}

export async function PUT(req: Request) {
  const body = await req.json();
  writeConfig(body);
  return NextResponse.json({ ok: true });
}

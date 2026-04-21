import { NextResponse } from "next/server";
import { readEntries, writeEntries, type Entry } from "@/lib/db";

export async function GET() {
  const entries = readEntries().sort((a, b) => a.createdAt - b.createdAt);
  return NextResponse.json(entries);
}

export async function POST(req: Request) {
  const entry: Entry = await req.json();
  const entries = readEntries();
  entries.push(entry);
  writeEntries(entries);
  return NextResponse.json({ ok: true });
}

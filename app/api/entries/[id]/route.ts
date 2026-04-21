import { NextResponse } from "next/server";
import { readEntries, writeEntries } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entries = readEntries().filter((e) => e.id !== id);
  writeEntries(entries);
  return NextResponse.json({ ok: true });
}

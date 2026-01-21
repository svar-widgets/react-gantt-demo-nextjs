import { NextResponse } from "next/server";
import { getAllLinks, createLink } from "@/lib/db";

export async function GET() {
  const links = getAllLinks();
  return NextResponse.json(links);
}

export async function POST(request: Request) {
  const body = await request.json();
  const id = createLink(body);
  return NextResponse.json({ id: Number(id) });
}

import { NextResponse } from "next/server";
import { getLinksByTaskId, updateLink, deleteLink } from "@/lib/db";

type RouteParams = { params: Promise<{ id: string }> };

// Legacy scheme: GET treats id as taskId (returns links for that task)
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const links = getLinksByTaskId(Number(id));
  return NextResponse.json(links);
}

// Legacy scheme: PUT treats id as linkId
export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const linkId = updateLink(Number(id), body);
  return NextResponse.json({ id: Number(linkId) });
}

// Legacy scheme: DELETE treats id as linkId
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  deleteLink(Number(id));
  return NextResponse.json({});
}

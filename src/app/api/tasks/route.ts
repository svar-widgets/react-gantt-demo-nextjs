import { NextResponse } from "next/server";
import { getAllTasks, createTask } from "@/lib/db";

export async function GET() {
  const tasks = getAllTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const mode = body.mode ?? "child";
  const target = body.target ?? 0;
  const id = createTask(body.task, mode, target);
  return NextResponse.json({ id: Number(id) });
}

import { NextResponse } from "next/server";
import { getTaskById, updateTask, deleteTask, moveTask } from "@/lib/db";

type RouteParams = { params: Promise<{ taskId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { taskId } = await params;
  const task = getTaskById(Number(taskId));
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { taskId } = await params;
  const body = await request.json();

  if (body.operation === "move") {
    const id = moveTask(Number(taskId), body.target, body.mode);
    return NextResponse.json({ id: Number(id) });
  }

  const id = updateTask(Number(taskId), body);
  return NextResponse.json({ id: Number(id) });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { taskId } = await params;
  deleteTask(Number(taskId));
  return NextResponse.json({});
}

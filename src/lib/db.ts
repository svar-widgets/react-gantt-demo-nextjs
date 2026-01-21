import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "gantt.db");
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("journal_mode = WAL");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT DEFAULT '',
    start TEXT,
    end TEXT,
    duration INTEGER,
    progress INTEGER DEFAULT 0,
    type TEXT,
    parent INTEGER DEFAULT 0,
    orderId INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source INTEGER NOT NULL,
    target INTEGER NOT NULL,
    type TEXT NOT NULL
  );
`);

// ============================================================
// Index Helper Functions
// ============================================================

/**
 * Get the next available orderId for a given parent branch.
 * Returns MAX(orderId) + 1, or 1 if no siblings exist.
 */
function getNextOrderId(parentId: number): number {
  const result = db
    .prepare("SELECT MAX(orderId) as maxOrder FROM tasks WHERE parent = ?")
    .get(parentId) as { maxOrder: number | null };
  return (result?.maxOrder ?? 0) + 1;
}

/**
 * Shift sibling orderIds to make room for an insertion.
 * - "after" mode: shifts all siblings with orderId > fromOrderId
 * - "before" mode: shifts all siblings with orderId >= fromOrderId (including target)
 * @param excludeId - optional task ID to exclude from shifting (used in moveTask)
 */
function shiftOrderIds(
  parentId: number,
  fromOrderId: number,
  mode: "after" | "before",
  excludeId?: number
): void {
  const excludeClause = excludeId !== undefined ? " AND id != ?" : "";
  const params =
    excludeId !== undefined
      ? [parentId, fromOrderId, excludeId]
      : [parentId, fromOrderId];

  if (mode === "after") {
    db.prepare(
      `UPDATE tasks SET orderId = orderId + 1 WHERE parent = ? AND orderId > ?${excludeClause}`
    ).run(...params);
  } else {
    db.prepare(
      `UPDATE tasks SET orderId = orderId + 1 WHERE parent = ? AND orderId >= ?${excludeClause}`
    ).run(...params);
  }
}

// Seed initial data if tables are empty
const taskCount = db.prepare("SELECT COUNT(*) as count FROM tasks").get() as {
  count: number;
};

if (taskCount.count === 0) {
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, text, start, end, progress, type, parent, orderId)
    VALUES (@id, @text, @start, @end, @progress, @type, @parent, @orderId)
  `);

  const insertLink = db.prepare(`
    INSERT INTO links (id, source, target, type)
    VALUES (@id, @source, @target, @type)
  `);

  // orderId is per-branch (relative to siblings with same parent)
  // parent=0 means top-level task
  const initialTasks = [
    {
      id: 1,
      text: "Project Planning",
      start: "2024-01-01",
      end: "2024-01-10",
      progress: 100,
      type: "summary",
      parent: 0,
      orderId: 1, // top-level, 1st
    },
    {
      id: 2,
      text: "Requirements Gathering",
      start: "2024-01-01",
      end: "2024-01-05",
      progress: 100,
      type: null,
      parent: 1,
      orderId: 1, // child of 1, 1st
    },
    {
      id: 3,
      text: "Technical Specification",
      start: "2024-01-05",
      end: "2024-01-10",
      progress: 80,
      type: null,
      parent: 1,
      orderId: 2, // child of 1, 2nd
    },
    {
      id: 4,
      text: "Development Phase",
      start: "2024-01-11",
      end: "2024-02-15",
      progress: 60,
      type: "summary",
      parent: 0,
      orderId: 2, // top-level, 2nd
    },
    {
      id: 5,
      text: "Backend Development",
      start: "2024-01-11",
      end: "2024-02-01",
      progress: 75,
      type: null,
      parent: 4,
      orderId: 1, // child of 4, 1st
    },
    {
      id: 6,
      text: "Frontend Development",
      start: "2024-01-15",
      end: "2024-02-10",
      progress: 50,
      type: null,
      parent: 4,
      orderId: 2, // child of 4, 2nd
    },
    {
      id: 7,
      text: "Integration",
      start: "2024-02-10",
      end: "2024-02-15",
      progress: 30,
      type: null,
      parent: 4,
      orderId: 3, // child of 4, 3rd
    },
    {
      id: 8,
      text: "Testing & QA",
      start: "2024-02-16",
      end: "2024-02-28",
      progress: 0,
      type: null,
      parent: 0,
      orderId: 3, // top-level, 3rd
    },
    {
      id: 9,
      text: "Deployment",
      start: "2024-03-01",
      end: "2024-03-05",
      progress: 0,
      type: "milestone",
      parent: 0,
      orderId: 4, // top-level, 4th
    },
  ];

  const initialLinks = [
    { id: 1, source: 2, target: 3, type: "e2s" },
    { id: 2, source: 3, target: 5, type: "e2s" },
    { id: 3, source: 5, target: 6, type: "s2s" },
    { id: 4, source: 6, target: 7, type: "e2s" },
    { id: 5, source: 7, target: 8, type: "e2s" },
    { id: 6, source: 8, target: 9, type: "e2s" },
  ];

  const seedData = db.transaction(() => {
    for (const task of initialTasks) {
      insertTask.run(task);
    }
    for (const link of initialLinks) {
      insertLink.run(link);
    }
  });

  seedData();
}

// Task operations
export function getAllTasks() {
  return db.prepare("SELECT * FROM tasks ORDER BY orderId").all();
}

export function getTaskById(id: number) {
  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
}

export function createTask(
  task: {
    text?: string;
    start?: string;
    end?: string;
    duration?: number;
    progress?: number;
    type?: string;
    parent?: number;
  },
  mode: "child" | "after" | "before" = "child",
  target: number = 0
) {
  let parentId: number;
  let newOrderId: number;

  if (mode === "child") {
    // Add as last child of target (target=0 means top level)
    parentId = target;
    newOrderId = getNextOrderId(parentId);
  } else {
    // mode === "after" or "before": insert relative to target sibling
    const targetTask = getTaskById(target) as
      | { parent: number; orderId: number }
      | undefined;

    if (!targetTask) {
      // Fallback to top level if target not found
      parentId = 0;
      newOrderId = getNextOrderId(0);
    } else {
      parentId = targetTask.parent;
      shiftOrderIds(parentId, targetTask.orderId, mode);
      newOrderId =
        mode === "after" ? targetTask.orderId + 1 : targetTask.orderId;
    }
  }

  const result = db
    .prepare(
      `INSERT INTO tasks (text, start, end, duration, progress, type, parent, orderId)
       VALUES (@text, @start, @end, @duration, @progress, @type, @parent, @orderId)`
    )
    .run({
      text: task.text ?? "",
      start: task.start ?? null,
      end: task.end ?? null,
      duration: task.duration ?? null,
      progress: task.progress ?? 0,
      type: task.type ?? null,
      parent: parentId,
      orderId: newOrderId,
    });
  return result.lastInsertRowid;
}

export function updateTask(
  id: number,
  task: {
    text?: string;
    start?: string;
    end?: string;
    duration?: number;
    progress?: number;
    type?: string;
    parent?: number;
  }
) {
  const fields: string[] = [];
  const values: Record<string, unknown> = { id };

  if (task.text !== undefined) {
    fields.push("text = @text");
    values.text = task.text;
  }
  if (task.start !== undefined) {
    fields.push("start = @start");
    values.start = task.start;
  }
  if (task.end !== undefined) {
    fields.push("end = @end");
    values.end = task.end;
  }
  if (task.duration !== undefined) {
    fields.push("duration = @duration");
    values.duration = task.duration;
  }
  if (task.progress !== undefined) {
    fields.push("progress = @progress");
    values.progress = task.progress;
  }
  if (task.type !== undefined) {
    fields.push("type = @type");
    values.type = task.type;
  }
  if (task.parent !== undefined) {
    fields.push("parent = @parent");
    values.parent = task.parent;
  }

  if (fields.length === 0) return id;

  db.prepare(`UPDATE tasks SET ${fields.join(", ")} WHERE id = @id`).run(
    values
  );
  return id;
}

export function deleteTask(id: number) {
  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
}

export function moveTask(
  id: number,
  target: number,
  mode: "after" | "before" | "child"
) {
  let parentId: number;
  let newOrderId: number;

  if (mode === "child") {
    // Become last child of target (target is the new parent)
    parentId = target;
    newOrderId = getNextOrderId(parentId);
  } else {
    // "after" or "before": become sibling of target
    const targetTask = getTaskById(target) as
      | { parent: number; orderId: number }
      | undefined;

    if (!targetTask) return id;

    parentId = targetTask.parent;

    // Shift siblings (exclude moving task for same-branch moves)
    shiftOrderIds(parentId, targetTask.orderId, mode, id);
    newOrderId =
      mode === "after" ? targetTask.orderId + 1 : targetTask.orderId;
  }

  // Update both parent and orderId
  db.prepare("UPDATE tasks SET parent = ?, orderId = ? WHERE id = ?").run(
    parentId,
    newOrderId,
    id
  );
  return id;
}

// Link operations
export function getAllLinks() {
  return db.prepare("SELECT * FROM links").all();
}

export function getLinksByTaskId(taskId: number) {
  return db
    .prepare("SELECT * FROM links WHERE source = ? OR target = ?")
    .all(taskId, taskId);
}

export function getLinkById(id: number) {
  return db.prepare("SELECT * FROM links WHERE id = ?").get(id);
}

export function createLink(link: {
  source: number;
  target: number;
  type: string;
}) {
  const result = db
    .prepare(
      `
    INSERT INTO links (source, target, type)
    VALUES (@source, @target, @type)
  `
    )
    .run(link);
  return result.lastInsertRowid;
}

export function updateLink(
  id: number,
  link: {
    source?: number;
    target?: number;
    type?: string;
  }
) {
  const fields: string[] = [];
  const values: Record<string, unknown> = { id };

  if (link.source !== undefined) {
    fields.push("source = @source");
    values.source = link.source;
  }
  if (link.target !== undefined) {
    fields.push("target = @target");
    values.target = link.target;
  }
  if (link.type !== undefined) {
    fields.push("type = @type");
    values.type = link.type;
  }

  if (fields.length === 0) return id;

  db.prepare(`UPDATE links SET ${fields.join(", ")} WHERE id = @id`).run(
    values
  );
  return id;
}

export function deleteLink(id: number) {
  db.prepare("DELETE FROM links WHERE id = ?").run(id);
}

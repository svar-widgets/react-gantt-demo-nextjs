"use client";

import { useState, useEffect } from "react";
import { Gantt, Willow } from "@svar-ui/react-gantt";
import "@svar-ui/react-gantt/all.css";

const tasks = [
  {
    id: 1,
    text: "Project Planning",
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 10),
    progress: 100,
    type: "summary",
    open: true,
  },
  {
    id: 2,
    text: "Requirements Gathering",
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 5),
    progress: 100,
    parent: 1,
  },
  {
    id: 3,
    text: "Technical Specification",
    start: new Date(2024, 0, 5),
    end: new Date(2024, 0, 10),
    progress: 80,
    parent: 1,
  },
  {
    id: 4,
    text: "Development Phase",
    start: new Date(2024, 0, 11),
    end: new Date(2024, 1, 15),
    progress: 60,
    type: "summary",
    open: true,
  },
  {
    id: 5,
    text: "Backend Development",
    start: new Date(2024, 0, 11),
    end: new Date(2024, 1, 1),
    progress: 75,
    parent: 4,
  },
  {
    id: 6,
    text: "Frontend Development",
    start: new Date(2024, 0, 15),
    end: new Date(2024, 1, 10),
    progress: 50,
    parent: 4,
  },
  {
    id: 7,
    text: "Integration",
    start: new Date(2024, 1, 10),
    end: new Date(2024, 1, 15),
    progress: 30,
    parent: 4,
  },
  {
    id: 8,
    text: "Testing & QA",
    start: new Date(2024, 1, 16),
    end: new Date(2024, 1, 28),
    progress: 0,
  },
  {
    id: 9,
    text: "Deployment",
    start: new Date(2024, 2, 1),
    end: new Date(2024, 2, 5),
    progress: 0,
    type: "milestone",
  },
];

const links = [
  { id: 1, source: 2, target: 3, type: "e2s" },
  { id: 2, source: 3, target: 5, type: "e2s" },
  { id: 3, source: 5, target: 6, type: "s2s" },
  { id: 4, source: 6, target: 7, type: "e2s" },
  { id: 5, source: 7, target: 8, type: "e2s" },
  { id: 6, source: 8, target: 9, type: "e2s" },
];

const scales = [
  { unit: "month", step: 1, format: "%M %Y" },
  { unit: "week", step: 1, format: "Week %w" },
];

export default function GanttChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ height: "100%", width: "100%" }} />;
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Willow>
        <Gantt tasks={tasks} links={links} scales={scales} />
      </Willow>
    </div>
  );
}

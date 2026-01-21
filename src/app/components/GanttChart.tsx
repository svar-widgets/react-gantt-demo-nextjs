"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { ITask, ILink, IApi } from "@svar-ui/react-gantt";
import { Gantt, Toolbar, Willow, Editor } from "@svar-ui/react-gantt";
import { RestDataProvider } from "@svar-ui/gantt-data-provider";
import "@svar-ui/react-gantt/all.css";

const apiUrl = "/api";

const scales = [
  { unit: "month", step: 1, format: "%M %Y" },
  { unit: "week", step: 1, format: "Week %w" },
];

export default function GanttChart() {
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [links, setLinks] = useState<ILink[]>([]);
  const [api, setApi] = useState<IApi | undefined>();

  const server = useMemo(() => new RestDataProvider(apiUrl), []);

  useEffect(() => {
    setMounted(true);
    server.getData().then((data) => {
      setTasks(data.tasks);
      setLinks(data.links);
    });
  }, [server]);

  const init = useCallback((ganttApi: IApi) => {
    setApi(ganttApi);
    ganttApi.setNext(server);
  }, [server]);

  if (!mounted) {
    return <div style={{ height: "100%", width: "100%" }} />;
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Willow>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ borderBottom: "1px solid #e0e0e0" }}>
            <Toolbar api={api} />
          </div>
          <Gantt tasks={tasks} links={links} scales={scales} init={init} />
          <div style={{ flex: 1 }}>
            {api && <Editor api={api} />}
          </div>
        </div>
      </Willow>
    </div>
  );
}

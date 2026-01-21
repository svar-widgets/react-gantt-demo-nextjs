import GanttChart from "./components/GanttChart";

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900">
      <header className="p-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          SVAR Gantt in Next.js
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          A showcase of @svar-ui/react-gantt component integration with Next.js
        </p>
      </header>

      <main className="flex-1 min-h-0 border-t border-zinc-200 dark:border-zinc-700">
        <GanttChart />
      </main>
    </div>
  );
}

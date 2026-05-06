import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, GripVertical, ListTodo, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { DatePicker } from "../components/ui/date-picker";
import TaskForm from "../features/tasks/TaskForm";
import TaskList from "../features/tasks/TaskList";
import { readableDate, todayKey } from "../lib/utils";
import { useTasks } from "../context/TaskContext";

const filters = [
  { key: "date", label: "Selected Day", icon: CalendarDays },
  { key: "today", label: "Today", icon: ListTodo },
  { key: "upcoming", label: "Upcoming", icon: Sparkles },
  { key: "completed", label: "Completed", icon: CheckCircle2 }
];

export default function TasksPage() {
  const { fetchTasks, tasks } = useTasks();
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [view, setView] = useState("date");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [draggingPanel, setDraggingPanel] = useState(null);
  const [panelOrder, setPanelOrder] = useState(() => {
    const savedOrder = localStorage.getItem("stride_task_panel_order");
    return savedOrder ? JSON.parse(savedOrder) : ["planner", "viewer"];
  });

  const params = useMemo(() => {
    const next = debouncedSearch ? { search: debouncedSearch } : {};
    if (view === "date") next.date = selectedDate;
    else next.view = view;
    return next;
  }, [selectedDate, view, debouncedSearch]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    fetchTasks(params);
  }, [params]);

  useEffect(() => {
    localStorage.setItem("stride_task_panel_order", JSON.stringify(panelOrder));
  }, [panelOrder]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const openCount = tasks.length - completedCount;
  const swapPanels = (targetPanel) => {
    if (!draggingPanel || draggingPanel === targetPanel) return;
    setPanelOrder((current) => [...current].reverse());
    setDraggingPanel(null);
  };

  const startPanelDrag = (event, panel) => {
    if (event.target.closest("input, textarea, button, a")) {
      event.preventDefault();
      return;
    }

    setDraggingPanel(panel);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", panel);
  };

  const panelClass = (panel) =>
    `rounded-lg transition ${draggingPanel && draggingPanel !== panel ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background" : ""
    }`;

  const plannerPanel = (
    <div
      key="planner"
      draggable
      onDragStart={(event) => startPanelDrag(event, "planner")}
      onDragEnd={() => setDraggingPanel(null)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => swapPanels("planner")}
      className={panelClass("planner")}
    >
      <div className="mb-3 flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm">
        <GripVertical className="h-4 w-4" />
        Drag panel left or right
      </div>
      <aside className="space-y-6">
        <TaskForm onCreated={(date) => setSelectedDate(date)} />

        <section className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <label className="text-sm font-medium" htmlFor="selected-date">
              Selected Date
            </label>
            <DatePicker
              value={selectedDate}
              onChange={(value) => {
                setSelectedDate(value);
                setView("date");
              }}
              className="mt-2"
            />
          </div>

          <div className="grid gap-2">
            {filters.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                type="button"
                variant={view === key ? "default" : "ghost"}
                className="h-11 justify-start rounded-lg"
                onClick={() => setView(key)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );

  const viewerPanel = (
    <div
      key="viewer"
      draggable
      onDragStart={(event) => startPanelDrag(event, "viewer")}
      onDragEnd={() => setDraggingPanel(null)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => swapPanels("viewer")}
      className={panelClass("viewer")}
    >
      <div className="mb-3 flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm">
        <GripVertical className="h-4 w-4" />
        Drag panel left or right
      </div>
      <TaskList selectedDate={selectedDate} view={view} search={search} setSearch={setSearch} />
    </div>
  );

  const panels = {
    planner: plannerPanel,
    viewer: viewerPanel
  };

  return (
    <div className="space-y-6 mb-6">
      <section className="overflow-hidden rounded-lg border bg-card shadow-soft">
        <div className="grid gap-6 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-md border bg-background/80 px-3 py-1 text-xs font-medium text-primary shadow-sm">
              <CalendarDays className="h-3.5 w-3.5" />
              Task planner
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Shape your day into focused time blocks.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              Schedule tasks with a start and end time, then complete them to earn Rewards.
            </p>
          </div>

          <div className="grid min-w-56 gap-3 rounded-lg border bg-background/80 p-4 shadow-sm">
            <div>
              <p className="text-sm text-muted-foreground">Current View</p>
              <p className="mt-1 text-xl font-semibold">
                {view === "date" ? readableDate(selectedDate) : filters.find((filter) => filter.key === view)?.label}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border bg-card p-3">
                <p className="text-xs text-muted-foreground">Open</p>
                <p className="mt-1 text-2xl font-semibold">{openCount}</p>
              </div>
              <div className="rounded-md border bg-card p-3">
                <p className="text-xs text-muted-foreground">Done</p>
                <p className="mt-1 text-2xl font-semibold">{completedCount}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className={`grid gap-6 ${panelOrder[0] === "planner" ? "xl:grid-cols-[380px_1fr]" : "xl:grid-cols-[1fr_380px]"
          }`}
      >
        {panelOrder.map((panel) => panels[panel])}
      </div>
    </div>
  );
}

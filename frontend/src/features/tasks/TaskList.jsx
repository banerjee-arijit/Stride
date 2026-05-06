import { Check, Clock3, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { readableDate } from "../../lib/utils";
import { useTasks } from "../../context/TaskContext";

const titleForView = (view, selectedDate) => {
  if (view === "date") return readableDate(selectedDate);
  return `${view[0].toUpperCase()}${view.slice(1)} Tasks`;
};

export default function TaskList({ selectedDate, view, search, setSearch }) {
  const { tasks, loading, completeTask, deleteTask } = useTasks();
  const navigate = useNavigate();
  const [pendingTask, setPendingTask] = useState(null);

  const handleComplete = async () => {
    if (!pendingTask) return;
    try {
      await completeTask(pendingTask._id);
      setPendingTask(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not complete task");
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-0">
        <div className="border-b bg-card p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Planner</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{titleForView(view, selectedDate)}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {tasks.length} task{tasks.length === 1 ? "" : "s"} in this view
              </p>
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by task name"
                className="h-11 rounded-lg pl-9"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border bg-primary/10">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No tasks here</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Your schedule is clear for this view. Add a time block when you are ready to focus.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {tasks.map((task) => {
              const startTime = task.startTime || task.dueTime || "--:--";
              const endTime = task.endTime || "--:--";

              return (
                <div
                  key={task._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/tasks/${task._id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") navigate(`/tasks/${task._id}`);
                  }}
                  className="grid cursor-pointer gap-4 p-5 transition hover:bg-muted/35 md:grid-cols-[auto_1fr_auto] md:items-center"
                >
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-primary/10 px-3 py-1.5 text-primary">
                    <p className="flex items-center gap-1.5 text-xs font-semibold">
                      <Clock3 className="h-4 w-4 text-primary" />
                      {startTime} - {endTime}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={task.completed ? "font-medium text-muted-foreground line-through" : "font-medium"}>
                        {task.title}
                      </h3>
                      <Badge variant={task.completed ? "success" : "muted"}>
                        {task.completed ? "Completed" : "Open"}
                      </Badge>
                      {task.pendingSync && <Badge variant="muted">Pending sync</Badge>}
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {task.subtitle || "No subtitle"}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">{readableDate(task.taskDate)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={task.completed ? "secondary" : "default"}
                      size="sm"
                      disabled={task.completed}
                      onClick={(event) => {
                        event.stopPropagation();
                        setPendingTask(task);
                      }}
                    >
                      <Check className="h-4 w-4" />
                      {task.completed ? "Done" : "Complete"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete task"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteTask(task._id).catch(() => toast.error("Could not delete task"));
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={Boolean(pendingTask)} onOpenChange={(open) => !open && setPendingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete task?</DialogTitle>
            <DialogDescription>
              You cannot undo this action. Are you sure you want to complete this task?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPendingTask(null)}>
              Discard
            </Button>
            <Button onClick={handleComplete}>Complete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

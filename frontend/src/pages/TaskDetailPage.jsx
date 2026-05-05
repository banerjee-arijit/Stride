import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock3, Save } from "lucide-react";
import { toast } from "sonner";
import api from "../api/client";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { DatePicker } from "../components/ui/date-picker";
import { TimePicker } from "../components/ui/time-picker";
import { readableDate } from "../lib/utils";

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const descriptionRef = useRef(null);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/tasks/${id}`)
      .then(({ data }) => setTask(data))
      .catch(() => {
        toast.error("Task not found");
        navigate("/tasks");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSave = async () => {
    const title = titleRef.current?.innerText.trim() || "";
    const subtitle = subtitleRef.current?.innerText.trim() || "";
    const description = descriptionRef.current?.innerText.trim() || "";

    if (!title) {
      toast.error("Task title is required");
      return;
    }

    if (!subtitle) {
      toast.error("Task subtitle is required");
      return;
    }

    if (title.split(/\s+/).filter(Boolean).length > 10) {
      toast.error("Title cannot be more than 10 words");
      return;
    }

    if (subtitle.split(/\s+/).filter(Boolean).length > 5) {
      toast.error("Subtitle cannot be more than 5 words");
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.patch(`/tasks/${id}`, {
        title,
        subtitle,
        description,
        taskDate: task.taskDate,
        startTime: task.startTime,
        endTime: task.endTime
      });
      setTask(data);
      toast.success("Task updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update task");
    } finally {
      setSaving(false);
    }
  };

  const updateTaskField = (field, value) => {
    setTask((current) => ({ ...current, [field]: value }));
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading task...</div>;
  }

  if (!task) return null;

  return (
    <div className="mx-auto max-w-4xl px-2 pb-16">
      <div className="sticky top-16 z-20 -mx-2 mb-8 flex items-center justify-between border-b bg-background/90 px-2 py-4 backdrop-blur">
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <Button onClick={handleSave} disabled={saving} size="sm">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <article className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Badge variant={task.completed ? "success" : "muted"}>
            {task.completed ? "Completed" : "Open"}
          </Badge>
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {readableDate(task.taskDate)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-primary">
            <Clock3 className="h-4 w-4" />
            {task.startTime} - {task.endTime}
          </span>
        </div>

        <div className="mb-10 grid gap-3 rounded-lg border bg-card p-4 shadow-sm sm:grid-cols-3">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Date</p>
            <DatePicker value={task.taskDate} onChange={(value) => updateTaskField("taskDate", value)} />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Start</p>
            <TimePicker value={task.startTime} onChange={(value) => updateTaskField("startTime", value)} />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">End</p>
            <TimePicker value={task.endTime} onChange={(value) => updateTaskField("endTime", value)} />
          </div>
        </div>

        <h1
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-16 break-words text-5xl font-bold leading-tight tracking-tight outline-none empty:before:text-muted-foreground empty:before:content-['Untitled_task']"
        >
          {task.title}
        </h1>

        <p
          ref={subtitleRef}
          contentEditable
          suppressContentEditableWarning
          className="mt-4 min-h-8 break-words text-2xl leading-snug text-muted-foreground outline-none empty:before:text-muted-foreground/70 empty:before:content-['Add_a_short_subtitle']"
        >
          {task.subtitle}
        </p>

        <div
          ref={descriptionRef}
          contentEditable
          suppressContentEditableWarning
          className="mt-8 min-h-[520px] whitespace-pre-wrap break-words text-lg leading-8 text-foreground outline-none empty:before:text-muted-foreground empty:before:content-['Start_writing_notes,_details,_steps,_or_ideas...']"
        >
          {task.description}
        </div>
      </article>
    </div>
  );
}

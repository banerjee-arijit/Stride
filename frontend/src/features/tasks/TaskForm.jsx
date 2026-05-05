import { useState } from "react";
import { CalendarPlus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { DatePicker } from "../../components/ui/date-picker";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { TimePicker } from "../../components/ui/time-picker";
import { todayKey } from "../../lib/utils";
import { useTasks } from "../../context/TaskContext";

const initialState = {
  title: "",
  subtitle: "",
  description: "",
  startTime: "09:00",
  endTime: "10:00",
  taskDate: todayKey()
};

export default function TaskForm({ onCreated }) {
  const { createTask } = useTasks();
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.endTime <= form.startTime) {
      toast.error("End time must be after start time");
      return;
    }

    if (form.title.trim().split(/\s+/).filter(Boolean).length > 10) {
      toast.error("Title cannot be more than 10 words");
      return;
    }

    if (form.subtitle.trim().split(/\s+/).filter(Boolean).length > 5) {
      toast.error("Subtitle cannot be more than 5 words");
      return;
    }

    setSaving(true);
    try {
      await createTask(form);
      setForm(initialState);
      onCreated?.(form.taskDate);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background/80 text-primary shadow-sm">
            <CalendarPlus className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Plan a Task</CardTitle>
            <CardDescription>Add a focused time block to your day.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Review project plan"
              required
            />
            <p className="text-xs text-muted-foreground">Maximum 10 words.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={form.subtitle}
              onChange={(event) => updateField("subtitle", event.target.value)}
              placeholder="Client deadline"
              required
            />
            <p className="text-xs text-muted-foreground">Maximum 5 words.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Task Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Add notes, context, steps, or a success condition"
            />
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskDate">Task Date</Label>
              <DatePicker value={form.taskDate} onChange={(value) => updateField("taskDate", value)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <TimePicker value={form.startTime} onChange={(value) => updateField("startTime", value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <TimePicker value={form.endTime} onChange={(value) => updateField("endTime", value)} />
              </div>
            </div>
          </div>

          <Button type="submit" className="h-11 w-full" disabled={saving}>
            <Plus className="h-4 w-4" />
            {saving ? "Adding..." : "Add Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Clock3, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { DatePicker } from "../../components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { todayKey, calculateDuration } from "../../lib/utils";
import { useTasks } from "../../context/TaskContext";

const pad = (value) => String(value).padStart(2, "0");

const getTimeKeyWithOffset = (minutesToAdd = 0) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutesToAdd, 0, 0);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatTimeLabel = (value) => {
  if (!value) return "--:--";
  const [hourValue, minuteValue] = value.split(":").map(Number);
  const suffix = hourValue >= 12 ? "PM" : "AM";
  const displayHour = hourValue % 12 || 12;
  return `${displayHour}:${pad(minuteValue)} ${suffix}`;
};

const toParts = (value) => {
  const [hourValue, minuteValue] = value.split(":").map(Number);
  const period = hourValue >= 12 ? "PM" : "AM";
  const hour = hourValue % 12 || 12;

  return {
    hour: String(hour),
    minute: pad(minuteValue),
    period
  };
};

const to24Hour = ({ hour, minute, period }) => {
  const parsedHour = Number(hour);
  const parsedMinute = Number(minute);

  if (
    !Number.isInteger(parsedHour) ||
    !Number.isInteger(parsedMinute) ||
    parsedHour < 0 ||
    parsedHour > 12 ||
    parsedMinute < 0 ||
    parsedMinute > 59
  ) {
    return null;
  }

  let hours24 = parsedHour % 12;
  if (period === "PM") {
    hours24 += 12;
  }

  return `${pad(hours24)}:${pad(parsedMinute)}`;
};

const clampNumericInput = (value, min, max) => {
  const numericValue = value.replace(/\D/g, "");
  if (!numericValue) return "";
  return String(Math.min(max, Math.max(min, Number(numericValue))));
};

const buildInitialState = () => ({
  title: "",
  subtitle: "",
  description: "",
  startTime: getTimeKeyWithOffset(0),
  endTime: getTimeKeyWithOffset(30),
  taskDate: todayKey()
});

export default function TaskForm({ onCreated }) {
  const { createTask } = useTasks();
  const [form, setForm] = useState(buildInitialState);
  const [saving, setSaving] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [timeError, setTimeError] = useState("");
  const [startDraft, setStartDraft] = useState(() => toParts(buildInitialState().startTime));
  const [endDraft, setEndDraft] = useState(() => toParts(buildInitialState().endTime));

  const currentTimeKey = useMemo(() => getTimeKeyWithOffset(0), [timeOpen, form.taskDate]);

  const syncDraftsFromForm = () => {
    setStartDraft(toParts(form.startTime));
    setEndDraft(toParts(form.endTime));
    setTimeError("");
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    if (form.taskDate === todayKey() && form.startTime < getTimeKeyWithOffset(0)) {
      const nextStart = getTimeKeyWithOffset(0);
      const nextEnd = getTimeKeyWithOffset(30);
      setForm((current) => ({
        ...current,
        startTime: nextStart,
        endTime: nextEnd
      }));
    }
  }, [form.taskDate]);

  const applyTimeRange = () => {
    const nextStart = to24Hour(startDraft);
    const nextEnd = to24Hour(endDraft);

    if (!nextStart || !nextEnd) {
      setTimeError("Enter a valid hour and minute.");
      return;
    }

    if (form.taskDate === todayKey() && nextStart < currentTimeKey) {
      setTimeError("Start time must be at or after the current time.");
      return;
    }

    if (nextEnd === nextStart) {
      setTimeError("End time cannot be the same as start time.");
      return;
    }

    setForm((current) => ({
      ...current,
      startTime: nextStart,
      endTime: nextEnd
    }));
    setTimeOpen(false);
    setTimeError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.endTime === form.startTime) {
      toast.error("End time cannot be the same as start time");
      return;
    }

    if (form.taskDate < todayKey()) {
      toast.error("Task date cannot be in the past");
      return;
    }

    if (form.taskDate === todayKey() && form.startTime < getTimeKeyWithOffset(0)) {
      toast.error("You cannot create a task before the current time");
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
      toast.success(`Task saved! Total duration: ${calculateDuration(form.startTime, form.endTime)}`);
      const nextState = buildInitialState();
      setForm(nextState);
      setStartDraft(toParts(nextState.startTime));
      setEndDraft(toParts(nextState.endTime));
      onCreated?.(form.taskDate);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create task");
    } finally {
      setSaving(false);
    }
  };

  const timeSummary = `${formatTimeLabel(form.startTime)} - ${formatTimeLabel(form.endTime)}`;

  return (
    <>
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

              <div className="space-y-2">
                <Label>Time Range</Label>
                <button
                  type="button"
                  onClick={() => {
                    syncDraftsFromForm();
                    setTimeOpen(true);
                  }}
                  className="flex h-14 w-full items-center justify-between rounded-xl border bg-background px-4 text-left shadow-sm transition hover:border-primary/30 hover:bg-muted/20"
                >
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Start - End</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{timeSummary}</p>
                  </div>
                  <Clock3 className="h-4 w-4 text-primary" />
                </button>
              </div>
            </div>

            {form.taskDate === todayKey() && (
              <p className="text-xs text-muted-foreground">
                For today, tasks can only start at or after the current time.
              </p>
            )}

            <Button type="submit" className="h-11 w-full" disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? "Adding..." : "Add Task"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={timeOpen} onOpenChange={setTimeOpen}>
        <DialogContent className="max-w-2xl overflow-hidden rounded-3xl border bg-card p-0 shadow-soft">
          <div className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10 px-6 py-6 sm:px-8">
            <p className="text-xs font-semibold uppercase text-primary/80">Time range</p>
            <DialogTitle className="mt-2 text-2xl font-semibold tracking-tight">Set your task window</DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
              Choose a start and end time for this focused block.
            </DialogDescription>
          </div>

          <div className="space-y-5 px-6 py-6 sm:px-8">
            <div className="grid gap-4 lg:grid-cols-2">
              {[
                {
                  label: "Start time",
                  hourId: "start-hour",
                  minuteId: "start-minute",
                  draft: startDraft,
                  setDraft: setStartDraft
                },
                {
                  label: "End time",
                  hourId: "end-hour",
                  minuteId: "end-minute",
                  draft: endDraft,
                  setDraft: setEndDraft
                }
              ].map(({ label, hourId, minuteId, draft, setDraft }) => (
                <div key={label} className="rounded-2xl border bg-background/70 p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{label}</p>
                    <div className="grid grid-cols-2 rounded-xl border bg-muted/40 p-1">
                      {["AM", "PM"].map((period) => (
                        <button
                          key={period}
                          type="button"
                          onClick={() => setDraft((current) => ({ ...current, period }))}
                          className={`h-8 rounded-lg px-3 text-xs font-semibold transition ${
                            draft.period === period
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                    <div>
                      <Label htmlFor={hourId} className="text-xs text-muted-foreground">
                        Hour
                      </Label>
                      <Input
                        id={hourId}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={12}
                        step={1}
                        value={draft.hour}
                        onChange={(event) => setDraft((current) => ({ ...current, hour: clampNumericInput(event.target.value, 0, 12) }))}
                        placeholder="09"
                        className="mt-2 h-14 rounded-xl text-center text-xl font-semibold"
                      />
                    </div>

                    <span className="pb-3 text-2xl font-semibold text-muted-foreground">:</span>

                    <div>
                      <Label htmlFor={minuteId} className="text-xs text-muted-foreground">
                        Minute
                      </Label>
                      <Input
                        id={minuteId}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={59}
                        step={1}
                        value={draft.minute}
                        onChange={(event) => setDraft((current) => ({ ...current, minute: clampNumericInput(event.target.value, 0, 59) }))}
                        placeholder="30"
                        className="mt-2 h-14 rounded-xl text-center text-xl font-semibold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {form.taskDate === todayKey() && (
              <div className="rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                For today, start time must be at or after {formatTimeLabel(currentTimeKey)}.
              </div>
            )}

            {timeError && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {timeError}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
              <Button variant="outline" className="h-11 sm:min-w-24" onClick={() => setTimeOpen(false)}>
                Cancel
              </Button>
              <Button className="h-11 sm:min-w-28" onClick={applyTimeRange}>
                Apply time
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

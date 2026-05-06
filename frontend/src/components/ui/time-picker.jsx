import { useMemo, useState } from "react";
import { Clock3 } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";

const formatTime = (value) => {
  if (!value) return "Pick time";
  const [hour, minute] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(2026, 0, 1, hour, minute));
};

export function TimePicker({ value, onChange, className }) {
  const [open, setOpen] = useState(false);
  const times = useMemo(
    () =>
      Array.from({ length: 288 }, (_, index) => {
        const totalMinutes = index * 5;
        const hour = Math.floor(totalMinutes / 60);
        const minute = String(totalMinutes % 60).padStart(2, "0");
        return `${String(hour).padStart(2, "0")}:${minute}`;
      }),
    []
  );

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full justify-start rounded-lg bg-background"
        onClick={() => setOpen((current) => !current)}
      >
        <Clock3 className="h-4 w-4 text-primary" />
        <span>{formatTime(value)}</span>
      </Button>

      {open && (
        <div className="absolute left-0 top-12 z-50 max-h-72 w-52 overflow-y-auto rounded-lg border bg-card p-2 shadow-soft">
          {times.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => {
                onChange(time);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition hover:bg-muted",
                value === time && "bg-primary/10 font-medium text-primary"
              )}
            >
              {formatTime(time)}
              {value === time && <span className="h-2 w-2 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

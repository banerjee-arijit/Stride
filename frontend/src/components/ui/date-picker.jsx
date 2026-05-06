import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { cn, readableDate, todayKey } from "../../lib/utils";

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function DatePicker({ value, onChange, className }) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = value ? new Date(`${value}T00:00:00`) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const days = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - firstDay.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  const monthTitle = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(visibleMonth);

  const changeMonth = (amount) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full justify-start rounded-lg bg-background"
        onClick={() => setOpen((current) => !current)}
      >
        <CalendarDays className="h-4 w-4 text-primary" />
        <span>{value ? readableDate(value) : "Pick a date"}</span>
      </Button>

      {open && (
        <div className="absolute left-0 top-12 z-50 w-80 rounded-lg border bg-card p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <Button type="button" variant="ghost" size="icon" onClick={() => changeMonth(-1)} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-sm font-semibold">{monthTitle}</p>
            <Button type="button" variant="ghost" size="icon" onClick={() => changeMonth(1)} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdays.map((day) => (
              <div key={day} className="py-1 text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            {days.map((date) => {
              const key = toDateKey(date);
              const isSelected = key === value;
              const isToday = key === todayKey();
              const isPast = key < todayKey();
              const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (isPast) return;
                    onChange(key);
                    setOpen(false);
                  }}
                  disabled={isPast}
                  className={cn(
                    "h-9 rounded-md text-sm transition hover:bg-muted",
                    !isCurrentMonth && "text-muted-foreground/45",
                    isPast && "cursor-not-allowed text-muted-foreground/25 hover:bg-transparent",
                    isToday && "border border-primary/40",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary"
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

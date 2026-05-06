import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Flame,
  Quote,
  Sparkles,
  Target
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { todayKey } from "../lib/utils";

const quotes = [
  "Small promises kept become a strong identity.",
  "Focus is a practice, not a mood.",
  "Finish the next useful thing.",
  "Discipline feels quiet when it becomes familiar."
];

const chartTooltipLabel = (value, name, entry) => {
  if (!entry?.payload) return [value, name];
  return [value, `${entry.payload.dayLabel} (${entry.payload.date})`];
};

function StatCard({ icon: Icon, label, value, helper, accent = "primary" }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
          </div>
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
              accent === "gold" ? "bg-accent/15 text-foreground" : "bg-primary/10 text-primary"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, refreshProfile } = useAuth();
  const { tasks, fetchTasks } = useTasks();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchTasks({ view: "today" });
    refreshProfile().then(setProfile).catch(() => {});
  }, []);

  const quote = useMemo(() => quotes[new Date().getDay() % quotes.length], []);
  const today = todayKey();
  const todayTasks = tasks.filter((task) => task.taskDate === today);
  const openToday = todayTasks.filter((task) => !task.completed).length;
  const completedToday = todayTasks.filter((task) => task.completed).length;
  const score = user?.achievementScore || 0;
  const ringSize = 2 * Math.PI * 42;
  const nextTasks = todayTasks.filter((task) => !task.completed).slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border bg-card shadow-soft">
        <div className="grid gap-6 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 sm:p-8 lg:grid-cols-[1fr_300px] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-md border bg-background/80 px-3 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Today&apos;s command center
            </p>
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Stay focused, finish clean, and keep your momentum visible.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Complete tasks to earn Rewards, build streaks, and turn your workday into measurable progress.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/tasks"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:brightness-95"
              >
                Manage Tasks
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/profile"
                className="inline-flex h-10 items-center justify-center rounded-md border bg-background/80 px-4 text-sm font-medium shadow-sm transition hover:bg-muted"
              >
                View Profile
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-background/80 p-5 shadow-sm backdrop-blur">
            <div className="relative mx-auto grid h-36 w-36 place-items-center">
              <svg className="absolute h-36 w-36 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={ringSize}
                  strokeDashoffset={ringSize * (1 - score / 100)}
                />
              </svg>
              <div className="relative text-center">
                <p className="text-3xl font-semibold">{score}</p>
                <p className="text-xs text-muted-foreground">of 100</p>
              </div>
            </div>
            <div className="mt-5 text-center">
              <p className="font-medium">Rewards Progress</p>
              <p className="mt-1 text-sm text-muted-foreground">Earn +5 Rewards per completed task.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Award}
          label="Rewards"
          value={`${score}/100`}
          helper="Your current Rewards cycle"
        />
        <StatCard
          icon={CalendarCheck}
          label="Completed Today"
          value={completedToday}
          helper={`${openToday} task${openToday === 1 ? "" : "s"} still open`}
        />
        <StatCard
          icon={Flame}
          label="Daily Streak"
          value={user?.streak || 0}
          helper="days with completed work"
          accent="gold"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Weekly Completions</CardTitle>
              <CardDescription>Your last 7 days of completed tasks, including quieter days.</CardDescription>
            </div>
            <div className="rounded-md border bg-muted/40 px-3 py-1 text-sm text-muted-foreground">
              {profile?.stats?.completedTasks || 0} total completed
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profile?.stats?.weeklyCompleted || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="dayLabel" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  cursor={{ stroke: "hsl(var(--muted))", strokeWidth: 1 }}
                  formatter={chartTooltipLabel}
                  labelFormatter={(label) => label}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    color: "hsl(var(--foreground))"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className="h-5 w-5 text-primary" />
                Daily Focus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold leading-snug">{quote}</p>
              <div className="mt-6 rounded-lg border bg-muted/40 p-4">
                <p className="text-sm font-medium">Score Rule</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Every completed task gives +5 Rewards. When you hit 100, the cycle resets to 0.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Next Up Today
              </CardTitle>
              <CardDescription>Your open tasks for the current day.</CardDescription>
            </CardHeader>
            <CardContent>
              {nextTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-3 font-medium">All clear for today</p>
                  <p className="mt-1 text-sm text-muted-foreground">No open tasks are waiting.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nextTasks.map((task) => (
                    <div key={task._id} className="flex items-start justify-between gap-3 rounded-lg border bg-background/60 p-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{task.title}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5" />
                          {task.startTime || task.dueTime} - {task.endTime || "No end time"}
                        </p>
                      </div>
                      <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

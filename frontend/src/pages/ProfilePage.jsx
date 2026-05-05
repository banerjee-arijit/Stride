import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, CalendarCheck2, Mail, Sparkles, Trophy } from "lucide-react";
import AvatarIllustration from "../components/avatar/AvatarIllustration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    refreshProfile()
      .then((data) => setStats(data.stats))
      .catch(() => { });
  }, []);

  const score = user?.achievementScore || 0;
  const completionRate = stats?.totalTasks
    ? Math.round(((stats?.completedTasks || 0) / stats.totalTasks) * 100)
    : 0;
  const ringSize = 2 * Math.PI * 42;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-lg border bg-card shadow-soft">
        <div className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <Link to="/choose-avatar" state={{ fromProfile: true }} className="group relative shrink-0" title="Change avatar">
                <AvatarIllustration
                  avatarId={user?.avatar}
                  className="h-20 w-20 shadow-soft ring-4 ring-background transition group-hover:scale-105"
                />
                <span className="absolute inset-x-0 -bottom-2 mx-auto w-fit rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground opacity-0 shadow-sm transition group-hover:opacity-100">
                  Change
                </span>
              </Link>

              <div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-md border bg-background/80 px-2.5 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  Focus profile
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">{user?.name}</h1>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-lg border bg-background/80 p-4 shadow-sm backdrop-blur">
              <div className="relative grid h-24 w-24 place-items-center rounded-full">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
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
                <span className="text-xl font-semibold">{score}</span>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Achievement Score</p>
                <p className="mt-1 text-2xl font-semibold">{score}/100</p>
                <p className="mt-1 text-xs text-muted-foreground">+5 points for each completed task</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Progress</h2>
                  <p className="text-sm text-muted-foreground">Your current discipline score.</p>
                </div>
                <p className="text-sm font-semibold text-primary">{score}%</p>
              </div>
              <Progress value={score} className="h-4" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-5 shadow-sm">
                <CalendarCheck2 className="mb-4 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="mt-2 text-3xl font-semibold">{stats?.completedTasks || 0}</p>
              </div>

              <div className="rounded-lg border bg-card p-5 shadow-sm">
                <Award className="mb-4 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="mt-2 text-3xl font-semibold">{stats?.totalTasks || 0}</p>
              </div>

              <div className="rounded-lg border bg-card p-5 shadow-sm">
                <Trophy className="mb-4 h-5 w-5 text-accent" />
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="mt-2 text-3xl font-semibold">{user?.streak || 0}</p>
              </div>
            </div>
          </div>

          <Card className="border bg-background/60 shadow-none">
            <CardHeader>
              <CardTitle>Momentum</CardTitle>
              <CardDescription>How much of your task list is already done.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <p className="text-4xl font-semibold">{completionRate}%</p>
                  <p className="mt-1 text-sm text-muted-foreground">completion rate</p>
                </div>
                <div className="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {stats?.completedTasks || 0}/{stats?.totalTasks || 0}
                </div>
              </div>

              <Progress value={completionRate} className="h-3" />

              <div className="mt-6 rounded-lg border bg-card p-4">
                <p className="text-sm font-medium">Keep the streak warm</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Complete one meaningful task today and your dashboard moves forward with you.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

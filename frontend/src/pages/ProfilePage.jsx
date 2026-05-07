import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, CalendarCheck2, Mail, Sparkles, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import AvatarIllustration from "../components/avatar/AvatarIllustration";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { useAuth } from "../context/AuthContext";

const emojiRatings = [
  {
    value: "love",
    emoji: "\u{1F60D}",
    label: "Loved it",
    activeClass: "border-pink-300 bg-pink-100/80 text-pink-700 dark:bg-pink-500/15 dark:text-pink-200",
    glowClass: "from-pink-300/45 via-rose-300/25 to-transparent"
  },
  {
    value: "happy",
    emoji: "\u{1F642}",
    label: "Pretty good",
    activeClass: "border-emerald-300 bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
    glowClass: "from-emerald-300/45 via-teal-300/25 to-transparent"
  },
  {
    value: "mixed",
    emoji: "\u{1F610}",
    label: "Mixed",
    activeClass: "border-amber-300 bg-amber-100/80 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
    glowClass: "from-amber-300/45 via-yellow-300/25 to-transparent"
  },
  {
    value: "sad",
    emoji: "\u{1F615}",
    label: "Not great",
    activeClass: "border-sky-300 bg-sky-100/80 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200",
    glowClass: "from-sky-300/45 via-cyan-300/25 to-transparent"
  },
  {
    value: "done",
    emoji: "\u{1F635}",
    label: "I am done",
    activeClass: "border-violet-300 bg-violet-100/80 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200",
    glowClass: "from-violet-300/45 via-fuchsia-300/25 to-transparent"
  }
];

const deleteReasons = [
  "I finished what I needed",
  "The flow feels too strict",
  "I am trying another app",
  "I need a break from tracking",
  "Something felt confusing"
];

export default function ProfilePage() {
  const { user, refreshProfile, updateAchievementReward, deleteAccount, loading } = useAuth();
  const [stats, setStats] = useState(null);
  const [pledgeOpen, setPledgeOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [reward, setReward] = useState(user?.achievementReward || "");
  const [savingReward, setSavingReward] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteFeedback, setDeleteFeedback] = useState("");
  const [deleteRating, setDeleteRating] = useState("");

  useEffect(() => {
    refreshProfile()
      .then((data) => setStats(data.stats))
      .catch(() => { });
  }, []);

  useEffect(() => {
    setReward(user?.achievementReward || "");
  }, [user?.achievementReward]);

  const score = user?.achievementScore || 0;
  const completionRate = stats?.totalTasks
    ? Math.round(((stats?.completedTasks || 0) / stats.totalTasks) * 100)
    : 0;
  const ringSize = 2 * Math.PI * 42;

  const handleRewardSave = async () => {
    setSavingReward(true);
    try {
      await updateAchievementReward(reward.trim());
      toast.success("Pledge committed");
      setConfirmOpen(false);
      setCelebrate(true);
      window.setTimeout(() => {
        setCelebrate(false);
        setPledgeOpen(false);
      }, 1800);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not commit pledge");
    } finally {
      setSavingReward(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount({
        reason: deleteReason,
        feedback: deleteFeedback,
        rating: deleteRating
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete account");
    }
  };

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
                    strokeDashoffset={ringSize * (1 - score / 200)}
                  />
                </svg>
                <span className="text-xl font-semibold">{score}</span>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Rewards Progress</p>
                <p className="mt-1 text-2xl font-semibold">{score}/200</p>
                <p className="mt-1 text-xs text-muted-foreground">+5 Rewards for each completed task</p>
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
                  <p className="text-sm text-muted-foreground">Your current Rewards cycle.</p>
                </div>
                <p className="text-sm font-semibold text-primary">{score}/200</p>
              </div>
              <Progress value={(score / 200) * 100} className="h-4" />
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

              <div className="mt-6 overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/[0.07] via-background to-accent/[0.08]">
                <div className="border-b border-border/70 px-4 py-4">
                  <p className="text-sm font-semibold">Pledge</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    One personal reward for this full 0 to 200 cycle.
                  </p>
                </div>

                <div className="p-4">
                  {user?.achievementReward ? (
                    <div className="rounded-2xl border border-primary/15 bg-background/80 p-4 shadow-sm backdrop-blur">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/75">
                        Locked in
                      </p>
                      <p className="mt-3 text-base font-semibold leading-7 text-foreground">
                        {user.achievementReward}
                      </p>
                      <p className="mt-3 text-xs leading-5 text-muted-foreground">
                        This becomes editable again after you reach 200 Rewards and the cycle resets to 0.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-primary/20 bg-background/80 p-4 backdrop-blur">
                      <p className="text-sm font-medium text-foreground">Commit once for this cycle</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Make the finish line feel personal, then let the pledge carry some weight.
                      </p>
                      <Button size="sm" className="mt-4 rounded-full px-4" onClick={() => setPledgeOpen(true)}>
                        Add Pledge
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-destructive/20 bg-gradient-to-br from-destructive/[0.05] via-background to-background">
                <div className="border-b border-destructive/10 px-4 py-4">
                  <p className="text-sm font-semibold text-foreground">Delete account</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Remove your profile, tasks, and current Rewards cycle from the database.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 p-4">
                  <p className="max-w-[12rem] text-xs leading-5 text-muted-foreground">
                    We will ask for a reason, a quick mood rating, and optional feedback before it is gone.
                  </p>
                  <Button
                    variant="outline"
                    className="rounded-full border-destructive/25 px-4 text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Dialog
        open={pledgeOpen}
        onOpenChange={(open) => {
          setPledgeOpen(open);
          if (!open) {
            setConfirmOpen(false);
            setCelebrate(false);
          }
        }}
      >
        <DialogContent className="left-0 top-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-background p-0">
          <div className="relative flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(31,118,111,0.08),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.08),_transparent_20%)]">
            {celebrate && (
              <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
                {[
                  "left-[10%] top-[16%] bg-primary rotate-12",
                  "left-[18%] top-[9%] bg-accent -rotate-12",
                  "left-[30%] top-[18%] bg-primary rotate-45",
                  "left-[42%] top-[10%] bg-accent -rotate-6",
                  "left-[55%] top-[15%] bg-primary rotate-12",
                  "left-[67%] top-[8%] bg-accent rotate-45",
                  "left-[79%] top-[16%] bg-primary -rotate-12",
                  "left-[88%] top-[11%] bg-accent rotate-6",
                  "left-[22%] top-[30%] bg-accent rotate-12",
                  "left-[74%] top-[30%] bg-primary -rotate-12"
                ].map((position, index) => (
                  <span
                    key={position}
                    className={`absolute h-3 w-8 rounded-full opacity-80 animate-ping ${position}`}
                    style={{ animationDuration: `${900 + index * 100}ms` }}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur sm:px-10">
              <p className="text-sm font-medium text-muted-foreground">Pledge space</p>
            </div>

            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-y-auto px-6 py-10 sm:px-10">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-sm uppercase tracking-[0.2em] text-primary/80">200 Rewards cycle</p>
                <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  Write one promise you actually want to keep.
                </h2>
              </div>

              <div className="mx-auto mt-10 w-full max-w-3xl text-center text-base font-medium leading-8 text-muted-foreground sm:text-lg">
                I pledge that only after completing my tasks and reaching 200 Rewards
              </div>

              <div className="mx-auto mt-8 w-full max-w-3xl rounded-3xl bg-background/90 px-6 py-8 shadow-sm">
                <textarea
                  value={reward}
                  maxLength={60}
                  onChange={(event) => setReward(event.target.value)}
                  placeholder="I will watch a movie by myself, take a short trip, buy that book, or do something I genuinely care about."
                  className="min-h-[240px] w-full resize-none border-0 bg-transparent text-center text-3xl font-semibold leading-[1.25] tracking-tight outline-none placeholder:text-muted-foreground/30 sm:min-h-[260px] sm:text-5xl"
                />
                <div className="mt-4 flex flex-col items-center justify-center gap-1 text-sm font-medium transition-colors">
                  <span className={reward.length >= 60 ? "text-destructive" : "text-muted-foreground"}>
                    {reward.length} / 60 characters
                  </span>
                  {reward.length >= 60 && (
                    <span className="text-xs text-destructive/80 animate-in fade-in slide-in-from-bottom-1">
                      You have reached the character limit for a concise pledge.
                    </span>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 mx-auto mt-6 w-full max-w-3xl bg-gradient-to-t from-background via-background/95 to-transparent pb-6 pt-8">
                <div className="mx-auto flex w-fit flex-col items-center">
                  <button
                    type="button"
                    disabled={!reward.trim() || savingReward}
                    onClick={() => setConfirmOpen(true)}
                    className="group relative rounded-full border border-border bg-background px-8 py-3 text-center shadow-sm transition hover:border-primary/20 hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <span className="relative text-lg font-semibold tracking-[0.18em] text-primary transition group-hover:scale-[1.02]">
                      {savingReward ? "COMMITTING" : "COMMIT"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm rounded-3xl border bg-card p-6 shadow-soft">
          <div className="space-y-4 text-center">
            <p className="text-sm uppercase tracking-[0.16em] text-primary/80">Ready for your commit</p>
            <h3 className="text-2xl font-semibold tracking-tight">Lock this pledge in?</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              After this, you cannot change it until your Rewards cycle reaches 200 and resets.
            </p>
            <div className="rounded-2xl border bg-background/70 p-4 text-left text-base font-semibold leading-7">
              {reward}
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Let me check
              </Button>
              <Button onClick={handleRewardSave} disabled={savingReward}>
                {savingReward ? "Committing..." : "Commit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setDeleteReason("");
            setDeleteFeedback("");
            setDeleteRating("");
          }
        }}
      >
        <DialogContent className="max-h-[78vh] max-w-2xl overflow-hidden rounded-[2rem] border bg-card p-0 shadow-soft">
          <div className="flex max-h-[78vh] flex-col overflow-hidden rounded-[2rem]">
            <div className="border-b bg-gradient-to-br from-destructive/10 via-background to-primary/10 px-6 py-6 sm:px-8">
              <p className="text-sm uppercase tracking-[0.18em] text-destructive/80">Before you go</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">Delete your account</h3>
              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                Help us understand why you are leaving. We will save your feedback, then remove your account and tasks from Stride.
              </p>
            </div>

            <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6 sm:px-8">
              <div>
                <p className="text-sm font-medium">Reason for deleting</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {deleteReasons.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setDeleteReason(reason)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${deleteReason === reason
                          ? "border-destructive/40 bg-destructive/10 text-destructive"
                          : "border-border bg-background text-muted-foreground hover:border-destructive/20 hover:text-foreground"
                        }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Rate us with a mood</p>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {emojiRatings.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setDeleteRating(item.value)}
                      className={`rounded-2xl border px-3 py-4 text-center transition duration-200 ${deleteRating === item.value
                          ? `${item.activeClass} scale-[1.03] shadow-sm`
                          : "border-border bg-background hover:border-primary/20 hover:bg-muted/40"
                        }`}
                      title={item.label}
                    >
                      <div className="relative mx-auto grid h-11 w-11 place-items-center">
                        {deleteRating === item.value && (
                          <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.glowClass} animate-pulse`} />
                        )}
                        <span className={`relative text-2xl ${deleteRating === item.value ? "animate-bounce" : ""}`}>
                          {item.emoji}
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] font-medium text-muted-foreground">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Feedback</p>
                  <span className="text-xs text-muted-foreground">Optional</span>
                </div>
                <textarea
                  value={deleteFeedback}
                  onChange={(event) => setDeleteFeedback(event.target.value)}
                  placeholder="Tell us anything you wish felt better."
                  className="mt-3 min-h-[140px] w-full resize-none rounded-3xl border bg-background px-5 py-4 text-sm leading-7 outline-none transition placeholder:text-muted-foreground/55 focus:border-primary/30"
                />
              </div>
            </div>

            <div className="border-t bg-background/95 px-6 py-4 backdrop-blur sm:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  This action permanently deletes your account from the database.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={!deleteReason || !deleteRating || loading}
                >
                  {loading ? "Deleting..." : "Send & delete account"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

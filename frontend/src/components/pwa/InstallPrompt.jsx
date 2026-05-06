import { useEffect, useState } from "react";
import { CheckCircle2, Download, Laptop, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";

const DISMISS_KEY = "stride_install_prompt_dismissed";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === "true") return undefined;

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
      window.setTimeout(() => setOpen(true), 900);
    };

    const handleInstalled = () => {
      localStorage.setItem(DISMISS_KEY, "true");
      setInstallEvent(null);
      setOpen(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;

    setOpen(false);
    installEvent.prompt();

    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      localStorage.setItem(DISMISS_KEY, "true");
    }

    setInstallEvent(null);
  };

  const handleCancel = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setOpen(false);
  };

  if (!installEvent) return null;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleCancel()}>
      <DialogContent className="max-w-md overflow-hidden rounded-3xl border bg-card p-0 shadow-soft">
        <div className="relative">
          <div className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/10 px-6 py-6">
            <div className="flex items-start gap-4 pr-10">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <p className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-2.5 py-1 text-xs font-medium text-primary shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  Quick install
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">Add Stride to your device</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Launch your task tracker from the desktop and keep your day one click away.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="rounded-2xl border bg-background/70 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-primary">
                  <Laptop className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Desktop-style shortcut</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Opens in its own app window when your browser supports it.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Button className="h-12 rounded-xl text-base font-semibold" onClick={handleInstall}>
                <Download className="h-4 w-4" />
                Install Stride
              </Button>
              <Button variant="outline" className="h-12 rounded-xl px-5 text-base font-semibold" onClick={handleCancel}>
                Not now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

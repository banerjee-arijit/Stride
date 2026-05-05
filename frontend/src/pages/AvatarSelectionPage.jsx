import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import AvatarIllustration, { avatarOptions } from "../components/avatar/AvatarIllustration";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";

export default function AvatarSelectionPage() {
  const { user, updateAvatar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || avatarOptions[0].id);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAvatar(selectedAvatar);
      toast.success("Avatar saved");
      navigate(location.state?.fromProfile ? "/profile" : "/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save avatar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-5xl">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1 text-xs font-medium text-primary shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Choose your avatar
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Pick a little face for your Stride profile.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            You can change it anytime later by clicking your avatar on the profile page.
          </p>
        </div>

        <div className="mx-auto mb-8 flex h-56 w-56 items-center justify-center">
          <AvatarIllustration avatarId={selectedAvatar} className="h-52 w-52 border-8 border-card shadow-soft" />
        </div>

        <div className="mx-auto max-w-4xl overflow-x-auto pb-4">
          <div className="flex min-w-max gap-4 px-1">
            {avatarOptions.map((avatar) => {
              const isSelected = selectedAvatar === avatar.id;

              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`relative w-32 shrink-0 rounded-lg border bg-card p-3 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-soft ${
                    isSelected ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/50"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <AvatarIllustration avatarId={avatar.id} className="mx-auto h-20 w-20" />
                  <p className="mt-3 text-sm font-medium">{avatar.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button onClick={handleSave} disabled={saving} className="h-11 px-8">
            {saving ? "Saving..." : "Use This Avatar"}
          </Button>
        </div>
      </section>
    </main>
  );
}

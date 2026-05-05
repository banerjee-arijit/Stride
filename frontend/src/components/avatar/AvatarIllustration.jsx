import { cn } from "../../lib/utils";

export const avatarOptions = [
  { id: "sunrise", name: "Sunrise", bg: "from-amber-200 to-rose-300", hair: "#5b341f", skin: "#f3b98b", shirt: "#1f766f" },
  { id: "mint", name: "Mint", bg: "from-emerald-200 to-cyan-300", hair: "#123c4a", skin: "#e8aa7a", shirt: "#0f766e" },
  { id: "focus", name: "Focus", bg: "from-blue-200 to-indigo-300", hair: "#111827", skin: "#c78b63", shirt: "#2563eb" },
  { id: "spark", name: "Spark", bg: "from-fuchsia-200 to-orange-300", hair: "#6d28d9", skin: "#f0b38b", shirt: "#be123c" },
  { id: "orbit", name: "Orbit", bg: "from-slate-200 to-sky-300", hair: "#334155", skin: "#d6a57c", shirt: "#475569" },
  { id: "bloom", name: "Bloom", bg: "from-lime-200 to-teal-300", hair: "#365314", skin: "#f4c095", shirt: "#15803d" },
  { id: "ember", name: "Ember", bg: "from-red-200 to-amber-300", hair: "#7c2d12", skin: "#b77955", shirt: "#c2410c" },
  { id: "wave", name: "Wave", bg: "from-cyan-200 to-blue-300", hair: "#075985", skin: "#f1bd91", shirt: "#0284c7" }
];

export function getAvatarOption(id) {
  return avatarOptions.find((avatar) => avatar.id === id) || avatarOptions[0];
}

export default function AvatarIllustration({ avatarId, className }) {
  const avatar = getAvatarOption(avatarId);

  return (
    <div className={cn(`relative overflow-hidden rounded-full bg-gradient-to-br ${avatar.bg}`, className)}>
      <svg viewBox="0 0 140 140" className="h-full w-full" role="img" aria-label={`${avatar.name} avatar`}>
        <circle cx="70" cy="76" r="58" fill="rgba(255,255,255,0.22)" />
        <path d="M31 130C35 103 49 89 70 89C91 89 105 103 109 130H31Z" fill={avatar.shirt} />
        <circle cx="70" cy="61" r="31" fill={avatar.skin} />
        <path
          d="M39 58C42 34 56 23 75 25C94 27 104 42 101 63C92 54 82 48 69 48C57 48 47 52 39 58Z"
          fill={avatar.hair}
        />
        <path d="M48 60C50 39 65 30 88 33C82 24 66 19 52 27C39 35 34 47 39 63L48 60Z" fill={avatar.hair} />
        <circle cx="59" cy="64" r="3" fill="#111827" />
        <circle cx="81" cy="64" r="3" fill="#111827" />
        <path d="M60 78C66 84 75 84 81 78" stroke="#7c2d12" strokeWidth="4" strokeLinecap="round" />
        <path d="M45 103C50 94 58 89 70 89C82 89 90 94 95 103" stroke="rgba(255,255,255,0.35)" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

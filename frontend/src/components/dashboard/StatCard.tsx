import { cn } from "@/utils/cn";

type StatCardVariant = "indigo" | "sky" | "emerald";

const VARIANTS: Record<
  StatCardVariant,
  {
    card: string;
    iconWrap: string;
    label: string;
    value: string;
    glow: string;
  }
> = {
  indigo: {
    card: "from-indigo-500/10 via-white to-violet-500/5",
    iconWrap: "bg-indigo-500/15 text-indigo-600 ring-indigo-500/20",
    label: "text-indigo-600/90",
    value: "text-indigo-950",
    glow: "bg-indigo-400/20",
  },
  sky: {
    card: "from-sky-500/10 via-white to-cyan-500/5",
    iconWrap: "bg-sky-500/15 text-sky-600 ring-sky-500/20",
    label: "text-sky-700/90",
    value: "text-sky-950",
    glow: "bg-sky-400/20",
  },
  emerald: {
    card: "from-emerald-500/10 via-white to-teal-500/5",
    iconWrap: "bg-emerald-500/15 text-emerald-600 ring-emerald-500/20",
    label: "text-emerald-700/90",
    value: "text-emerald-950",
    glow: "bg-emerald-400/20",
  },
};

function StatIcon({ variant }: { variant: StatCardVariant }) {
  if (variant === "indigo") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17.5A2.5 2.5 0 0 1 20 7.5V16.5A2.5 2.5 0 0 1 17.5 19H6.5A2.5 2.5 0 0 1 4 16.5V7.5Z"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path d="M8 9.5H16M8 13H13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }
  if (variant === "sky") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M9 5.5H15M9 5.5V4.75A1.75 1.75 0 0 1 10.75 3H13.25A1.75 1.75 0 0 1 15 4.75V5.5M9 5.5H7.75A2.25 2.25 0 0 0 5.5 7.75V17.25A2.25 2.25 0 0 0 7.75 19.5H16.25A2.25 2.25 0 0 0 18.5 17.25V7.75A2.25 2.25 0 0 0 16.25 5.5H15"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 12H15M9 15.5H12.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M12 3.5L14.8 9.2L21 10.1L16.5 14.4L17.6 20.5L12 17.6L6.4 20.5L7.5 14.4L3 10.1L9.2 9.2L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M9.5 12.5L11 14L14.5 10.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  variant: StatCardVariant;
  hint?: string;
}

export function StatCard({ label, value, variant, hint }: StatCardProps) {
  const styles = VARIANTS[variant];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[22px] border border-white/80 bg-gradient-to-br p-5 shadow-[0_16px_48px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_56px_rgba(79,70,229,0.14)] sm:rounded-[26px] sm:p-6",
        styles.card
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl transition group-hover:scale-110",
          styles.glow
        )}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={cn("text-xs font-semibold uppercase tracking-[0.14em]", styles.label)}>
            {label}
          </p>
          <p className={cn("mt-3 text-4xl font-bold tabular-nums tracking-tight sm:text-[2.75rem]", styles.value)}>
            {value}
          </p>
          {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
        </div>

        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset",
            styles.iconWrap
          )}
        >
          <StatIcon variant={variant} />
        </div>
      </div>
    </div>
  );
}

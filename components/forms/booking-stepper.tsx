import { Check, Users, Calendar, UserRound, ClipboardList, type LucideIcon } from "lucide-react";

export const STEPS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "guests", label: "Guests", icon: Users },
  { key: "when", label: "When", icon: Calendar },
  { key: "details", label: "Details", icon: UserRound },
  { key: "review", label: "Review", icon: ClipboardList },
];

export function BookingStepper({ current }: { current: number }) {
  return (
    <ol className="mb-8 flex items-start">
      {STEPS.map((step, i) => {
        const isDone = i < current;
        const isCurrent = i === current;
        const Icon = step.icon;
        return (
          <li key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition ${
                  isDone
                    ? "border-brand-red bg-brand-red text-white"
                    : isCurrent
                      ? "border-brand-red bg-white text-brand-red"
                      : "border-brand-neutral bg-white text-black/30"
                }`}
              >
                {isDone ? <Check size={18} /> : <Icon size={18} />}
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isCurrent ? "text-brand-red" : isDone ? "text-black" : "text-black/35"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-2 mb-6 h-[2px] flex-1 ${isDone ? "bg-brand-red" : "bg-brand-neutral"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

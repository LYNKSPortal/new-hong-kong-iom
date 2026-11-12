import { Check, Users, Calendar, UserRound, ClipboardList, type LucideIcon } from "lucide-react";

export const STEPS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "guests", label: "Guests", icon: Users },
  { key: "when", label: "When", icon: Calendar },
  { key: "details", label: "Details", icon: UserRound },
  { key: "review", label: "Review", icon: ClipboardList },
];

export function BookingStepper({ current }: { current: number }) {
  return (
    <ol className="mb-6 flex items-start sm:mb-8">
      {STEPS.map((step, i) => {
        const isDone = i < current;
        const isCurrent = i === current;
        const Icon = step.icon;
        return (
          <li key={step.key} className="flex min-w-0 flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition sm:h-11 sm:w-11 ${
                  isDone
                    ? "border-brand-red bg-brand-red text-white"
                    : isCurrent
                      ? "border-brand-red bg-white text-brand-red"
                      : "border-brand-neutral bg-white text-black/30"
                }`}
              >
                {isDone ? <Check size={16} className="sm:hidden" /> : <Icon size={16} className="sm:hidden" />}
                {isDone ? <Check size={18} className="hidden sm:block" /> : <Icon size={18} className="hidden sm:block" />}
              </div>
              <span
                className={`text-center text-[10px] font-bold uppercase leading-tight tracking-wider sm:text-xs sm:tracking-wider ${
                  isCurrent ? "text-brand-red" : isDone ? "text-black" : "text-black/35"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-1 mb-5 h-[2px] flex-1 sm:mx-2 sm:mb-6 ${isDone ? "bg-brand-red" : "bg-brand-neutral"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function AdminFooter({
  title = "Bookings",
  pendingLabel = "pending",
  pendingCount,
  totalCount,
}: {
  title?: string;
  pendingLabel?: string;
  pendingCount: number;
  totalCount: number;
}) {
  return (
    <footer className="border-t border-white/10 bg-brand-charcoal px-4 py-6 sm:px-6 md:px-10 md:py-8">
      <div className="flex flex-wrap items-center justify-center gap-2 text-center sm:gap-3">
        <p className="eyebrow text-white/60">New Hong Kong</p>
        <span className="hidden text-white/30 sm:inline">·</span>
        <h2 className="display text-xl uppercase text-white sm:text-2xl">{title}</h2>
        <span className="hidden text-white/30 sm:inline">·</span>
        <p className="w-full text-sm text-white/50 sm:w-auto">
          {pendingCount} {pendingLabel} · {totalCount} total
        </p>
      </div>
    </footer>
  );
}

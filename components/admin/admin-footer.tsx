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
    <footer className="border-t border-white/10 bg-brand-charcoal px-10 py-8">
      <div className="flex flex-wrap items-center justify-center gap-3 text-center">
        <p className="eyebrow text-white/60">New Hong Kong</p>
        <span className="text-white/30">·</span>
        <h2 className="display text-2xl uppercase text-white">{title}</h2>
        <span className="text-white/30">·</span>
        <p className="text-sm text-white/50">
          {pendingCount} {pendingLabel} · {totalCount} total
        </p>
      </div>
    </footer>
  );
}

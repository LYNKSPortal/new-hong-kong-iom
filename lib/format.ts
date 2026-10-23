/** Formats a "YYYY-MM-DD" date string as "DD.MM.YYYY" for display. */
export function formatDateDMY(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}.${m}.${y}`;
}

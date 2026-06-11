import { formatDate } from "@/lib/utils";

export function FormattedTime({
  date,
  className,
}: {
  date: Date | string;
  className?: string;
}) {
  const d = typeof date === "string" ? new Date(date) : date;
  return (
    <time dateTime={d.toISOString()} className={className}>
      {formatDate(d)}
    </time>
  );
}

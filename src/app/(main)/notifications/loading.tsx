export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-4">
      <div className="h-8 w-24 rounded bg-stone-200" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 rounded border border-stone-200 bg-paper" />
      ))}
    </div>
  );
}

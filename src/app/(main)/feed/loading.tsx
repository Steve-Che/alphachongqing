export default function FeedLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-4">
      <div className="h-8 w-40 rounded bg-stone-200" />
      <div className="h-4 w-64 rounded bg-stone-100" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded border border-stone-200 bg-paper p-5">
          <div className="h-4 w-32 rounded bg-stone-100" />
          <div className="mt-3 h-16 rounded bg-stone-100" />
        </div>
      ))}
    </div>
  );
}

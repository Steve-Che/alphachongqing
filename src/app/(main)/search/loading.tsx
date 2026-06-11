export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-4">
      <div className="h-10 rounded border border-stone-200 bg-stone-100" />
      <div className="h-4 w-48 rounded bg-stone-100" />
      {[1, 2].map((i) => (
        <div key={i} className="h-12 rounded border border-stone-200 bg-paper" />
      ))}
    </div>
  );
}

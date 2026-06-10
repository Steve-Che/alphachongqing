import { MomentComposer } from "@/components/feed/MomentComposer";

export default function WriteMomentPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold">发短文</h1>
        <p className="mt-1 text-sm text-stone-500">
          像早期的微博——几句话，配几张图，不必短视频。
        </p>
      </header>
      <MomentComposer />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OnboardingStats = {
  hasResidence: boolean;
  postCount: number;
  following: number;
};

const DISMISS_KEY = "welcome-banner-dismissed";

export function WelcomeBanner() {
  const [stats, setStats] = useState<OnboardingStats | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.stats) setStats(data.stats);
      });
  }, []);

  if (!stats || dismissed) return null;

  const steps = [
    { done: true, label: "注册成为街坊" },
    {
      done: stats.hasResidence,
      label: (
        <>
          在<Link href="/" className="text-accent hover:underline"> 城市地图 </Link>
          开店或入住公寓
        </>
      ),
    },
    {
      done: stats.postCount > 0,
      label: (
        <>
          <Link href="/write/moment" className="text-accent hover:underline">发一条短文</Link>
        </>
      ),
    },
    {
      done: stats.following > 0,
      label: (
        <>
          在<Link href="/feed" className="text-accent hover:underline"> 街坊动态 </Link>
          关注邻居
        </>
      ),
    },
  ];

  const allDone = steps.every((s) => s.done);
  if (allDone) return null;

  return (
    <div className="rounded-lg border border-accent/40 bg-amber-50/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-serif text-lg font-semibold">欢迎成为新街坊！</h2>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, "1");
            setDismissed(true);
          }}
          className="text-xs text-stone-500 hover:text-stone-800"
        >
          收起
        </button>
      </div>
      <p className="mt-2 text-sm text-stone-600">完成下面步骤，融入这座虚拟山城：</p>
      <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-stone-700">
        {steps.map((step, i) => (
          <li key={i} className={step.done ? "text-stone-400 line-through" : ""}>
            {step.label}
            {step.done && " ✓"}
          </li>
        ))}
      </ol>
    </div>
  );
}

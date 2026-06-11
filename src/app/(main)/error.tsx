"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="font-serif text-2xl font-semibold text-stone-800">出了点状况</h1>
      <p className="mt-3 text-stone-600">城市暂时迷雾笼罩，请稍后再试。</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset}>
          重试
        </Button>
        <Link href="/" className="inline-flex items-center text-sm text-accent hover:underline">
          回到地图
        </Link>
      </div>
    </div>
  );
}

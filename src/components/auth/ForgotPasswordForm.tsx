"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GENERIC_SENT_MESSAGE,
  requestPasswordReset,
} from "@/app/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await requestPasswordReset(new FormData(e.currentTarget));
    if (result.ok) {
      setSent(true);
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-800">
          {GENERIC_SENT_MESSAGE}
        </p>
        <Link href="/login" className="block text-center text-sm text-accent hover:underline">
          返回登录
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div>
        <label className="mb-1 block text-sm text-stone-600">注册邮箱</label>
        <Input name="email" type="email" required placeholder="you@example.com" />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "发送中…" : "发送重置链接"}
      </Button>
      <p className="text-center text-sm text-stone-500">
        <Link href="/login" className="text-accent hover:underline">
          返回登录
        </Link>
      </p>
    </form>
  );
}

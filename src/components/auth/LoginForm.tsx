"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await loginUser(formData);
    if (result.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div>
        <label className="mb-1 block text-sm text-stone-600">邮箱</label>
        <Input name="email" type="email" required placeholder="you@example.com" />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm text-stone-600">密码</label>
          <Link href="/forgot-password" className="text-xs text-accent hover:underline">
            忘记密码？
          </Link>
        </div>
        <Input name="password" type="password" required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "登录中…" : "登录"}
      </Button>
    </form>
  );
}

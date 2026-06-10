"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/app/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          重置链接无效，请重新申请。
        </p>
        <Link
          href="/forgot-password"
          className="block text-center text-sm text-accent hover:underline"
        >
          申请重置密码
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("token", token);
    const result = await resetPassword(formData);
    if (result.ok) {
      router.push("/login?reset=1");
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
        <label className="mb-1 block text-sm text-stone-600">新密码</label>
        <Input name="password" type="password" required minLength={6} />
      </div>
      <div>
        <label className="mb-1 block text-sm text-stone-600">确认新密码</label>
        <Input name="confirm" type="password" required minLength={6} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "保存中…" : "设置新密码"}
      </Button>
    </form>
  );
}

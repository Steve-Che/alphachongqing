"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);
    if (result.ok) {
      router.push("/guide?welcome=1");
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
        <label className="mb-1 block text-sm text-stone-600">邀请码</label>
        <Input name="inviteCode" required placeholder="ALPHA2026" />
      </div>
      <div>
        <label className="mb-1 block text-sm text-stone-600">用户名</label>
        <Input name="username" required minLength={2} maxLength={20} />
      </div>
      <div>
        <label className="mb-1 block text-sm text-stone-600">邮箱</label>
        <Input name="email" type="email" required />
      </div>
      <div>
        <label className="mb-1 block text-sm text-stone-600">密码</label>
        <Input name="password" type="password" required minLength={6} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "注册中…" : "注册并进入城市"}
      </Button>
    </form>
  );
}

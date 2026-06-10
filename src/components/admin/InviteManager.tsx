"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInviteCode, revokeInviteCode } from "@/app/actions/invites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

type Invite = {
  id: string;
  code: string;
  maxUses: number;
  usedCount: number;
  expiresAt: Date | null;
  revoked: boolean;
  createdAt: Date;
  createdBy: { username: string };
};

export function InviteManager({ invites }: { invites: Invite[] }) {
  const router = useRouter();
  const [maxUses, setMaxUses] = useState("1");
  const [days, setDays] = useState("365");
  const [loading, setLoading] = useState(false);
  const [newCode, setNewCode] = useState("");

  async function handleCreate() {
    setLoading(true);
    const result = await createInviteCode(
      parseInt(maxUses, 10) || 1,
      parseInt(days, 10) || undefined,
    );
    if (result.ok && result.data) {
      setNewCode(result.data.code);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleRevoke(id: string) {
    await revokeInviteCode(id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded border border-stone-200 bg-paper p-4">
        <h2 className="font-serif text-lg font-semibold">生成邀请码</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <div>
            <label className="text-xs text-stone-500">可用次数</label>
            <Input
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="w-24"
            />
          </div>
          <div>
            <label className="text-xs text-stone-500">有效天数</label>
            <Input
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-24"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleCreate} disabled={loading} size="sm">
              {loading ? "生成中…" : "生成"}
            </Button>
          </div>
        </div>
        {newCode && (
          <p className="mt-3 text-sm">
            新邀请码：<code className="rounded bg-stone-100 px-2 py-1">{newCode}</code>
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-serif text-lg font-semibold">邀请码列表</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="py-2 pr-4">邀请码</th>
                <th className="py-2 pr-4">使用</th>
                <th className="py-2 pr-4">过期</th>
                <th className="py-2 pr-4">状态</th>
                <th className="py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((inv) => (
                <tr key={inv.id} className="border-b border-stone-100">
                  <td className="py-2 pr-4 font-mono">{inv.code}</td>
                  <td className="py-2 pr-4">
                    {inv.usedCount}/{inv.maxUses}
                  </td>
                  <td className="py-2 pr-4">
                    {inv.expiresAt ? formatDate(inv.expiresAt) : "永久"}
                  </td>
                  <td className="py-2 pr-4">
                    {inv.revoked ? "已作废" : "有效"}
                  </td>
                  <td className="py-2">
                    {!inv.revoked && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevoke(inv.id)}
                      >
                        作废
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

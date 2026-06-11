"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignStreetChief } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type StreetChiefManagerProps = {
  streets: {
    id: string;
    nameZh: string;
    slug: string;
    serviceChief: { id: string; username: string; displayName: string | null } | null;
  }[];
  users: { id: string; username: string; displayName: string | null }[];
};

export function StreetChiefManager({ streets, users }: StreetChiefManagerProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function assign(streetId: string, userId: string | null) {
    setLoadingId(streetId);
    setError("");
    const result = await assignStreetChief(streetId, userId);
    if (result.ok) {
      router.refresh();
    } else {
      setError(result.error);
    }
    setLoadingId(null);
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <ul className="space-y-2">
        {streets.map((street) => (
          <li
            key={street.id}
            className="flex flex-wrap items-center gap-2 rounded border border-stone-200 bg-paper px-3 py-2 text-sm"
          >
            <span className="min-w-[100px] font-medium">{street.nameZh}</span>
            <span className="text-stone-500">
              现任：
              {street.serviceChief
                ? street.serviceChief.displayName ?? street.serviceChief.username
                : "空缺"}
            </span>
            <select
              className="rounded border border-stone-300 px-2 py-1 text-sm"
              defaultValue={street.serviceChief?.id ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                assign(street.id, val || null);
              }}
              disabled={loadingId === street.id}
            >
              <option value="">— 空缺 —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayName ?? u.username}
                </option>
              ))}
            </select>
            {street.serviceChief && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loadingId === street.id}
                onClick={() => assign(street.id, null)}
              >
                卸任
              </Button>
            )}
          </li>
        ))}
      </ul>
      <p className="text-xs text-stone-500">
        也可输入用户 ID 任免（高级）：
      </p>
      <StreetChiefByIdForm streets={streets} onAssign={assign} loadingId={loadingId} />
    </div>
  );
}

function StreetChiefByIdForm({
  streets,
  onAssign,
  loadingId,
}: {
  streets: StreetChiefManagerProps["streets"];
  onAssign: (streetId: string, userId: string | null) => void;
  loadingId: string | null;
}) {
  const [streetId, setStreetId] = useState(streets[0]?.id ?? "");
  const [userId, setUserId] = useState("");

  return (
    <div className="flex flex-wrap gap-2">
      <select
        className="rounded border border-stone-300 px-2 py-1 text-sm"
        value={streetId}
        onChange={(e) => setStreetId(e.target.value)}
      >
        {streets.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nameZh}
          </option>
        ))}
      </select>
      <Input
        placeholder="用户 ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="max-w-xs"
      />
      <Button
        type="button"
        size="sm"
        disabled={!streetId || !userId || loadingId === streetId}
        onClick={() => onAssign(streetId, userId)}
      >
        指定
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { moveApartment } from "@/app/actions/shop";
import { MoveSuccessModal } from "@/components/residence/MoveSuccessModal";
import { Button } from "@/components/ui/button";

export function MoveApartmentButton({
  targetUnitId,
  targetLabel,
  currentLabel,
  compact = false,
}: {
  targetUnitId: string;
  targetLabel: string;
  currentLabel: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newUnitId, setNewUnitId] = useState("");
  const [message, setMessage] = useState("");

  async function handleClick() {
    const confirmed = confirm(
      `将从 ${currentLabel} 迁至 ${targetLabel}。\n\n个人主页与动态不变，公寓链接会更新为新房间。`,
    );
    if (!confirmed) return;

    setLoading(true);
    const result = await moveApartment(targetUnitId);
    if (result.ok && result.data) {
      setNewUnitId(result.data.id);
      setMessage(`${result.data.oldLabel} → ${result.data.newLabel}`);
      setModalOpen(true);
      toast.success("公寓搬家完成，新地址已更新");
      router.refresh();
    } else {
      toast.error(result.ok ? "搬家失败" : result.error);
    }
    setLoading(false);
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={compact ? "default" : "outline"}
        onClick={handleClick}
        disabled={loading}
        className={compact ? "mt-2" : undefined}
      >
        {loading ? "搬家中…" : compact ? "搬到此间" : "搬到此间"}
      </Button>
      <MoveSuccessModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (newUnitId) router.push(`/apartment/${newUnitId}`);
        }}
        type="apartment"
        message={message}
        primaryHref={newUnitId ? `/apartment/${newUnitId}` : "/"}
        primaryLabel="查看新公寓"
      />
    </>
  );
}

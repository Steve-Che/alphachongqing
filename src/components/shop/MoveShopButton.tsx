"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { moveShop } from "@/app/actions/shop";
import { MoveSuccessModal } from "@/components/residence/MoveSuccessModal";
import { Button } from "@/components/ui/button";

export function MoveShopButton({
  targetShopSlotId,
  targetStreetName,
  shopName,
  currentStreetName,
  compact = false,
}: {
  targetShopSlotId: string;
  targetStreetName: string;
  shopName: string;
  currentStreetName: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [shopSlug, setShopSlug] = useState("");
  const [message, setMessage] = useState("");

  async function handleClick() {
    const confirmed = confirm(
      `将把「${shopName}」从 ${currentStreetName} 迁至 ${targetStreetName}。\n\n店铺链接、房间布置与留言板均保留；旧铺位将变为空铺。`,
    );
    if (!confirmed) return;

    setLoading(true);
    const result = await moveShop(targetShopSlotId);
    if (result.ok && result.data) {
      setShopSlug(result.data.slug);
      setMessage(
        `「${result.data.shopName}」已从 ${result.data.oldStreetName} 迁至 ${result.data.newStreetName}。`,
      );
      setModalOpen(true);
      toast.success("店铺搬家完成");
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
        {loading ? "搬家中…" : compact ? "搬到此铺" : "搬到此铺"}
      </Button>
      <MoveSuccessModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type="shop"
        message={message}
        primaryHref={shopSlug ? `/shop/${shopSlug}` : "/"}
        primaryLabel="查看我的店铺"
      />
    </>
  );
}

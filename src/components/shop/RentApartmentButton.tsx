"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { rentApartment } from "@/app/actions/shop";
import { SettleSuccessModal } from "@/components/residence/SettleSuccessModal";
import { Button } from "@/components/ui/button";

export function RentApartmentButton({
  unitId,
  streetSlug,
}: {
  unitId: string;
  streetSlug?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [aptId, setAptId] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    const result = await rentApartment(unitId);
    if (result.ok && result.data) {
      setAptId(result.data.id);
      setModalOpen(true);
      toast.success("欢迎入住！");
    } else {
      setError(result.ok ? "选位失败" : result.error);
    }
    setLoading(false);
  }

  const streetHref = streetSlug ? `/street/${encodeURIComponent(streetSlug)}` : "/";

  return (
    <div>
      {error && <p className="mb-1 text-xs text-red-600">{error}</p>}
      <Button type="button" size="sm" onClick={handleClick} disabled={loading}>
        {loading ? "入住中…" : "选此间入住"}
      </Button>
      <SettleSuccessModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (aptId) router.push(`/apartment/${aptId}`);
        }}
        type="apartment"
        links={{
          primary: { href: "/write/moment", label: "发一条本街短文" },
          secondary: { href: streetHref, label: "逛本街动态" },
          tertiary: { href: "/feed", label: "去街坊动态 →" },
        }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rentApartment } from "@/app/actions/shop";
import { Button } from "@/components/ui/button";

export function RentApartmentButton({ unitId }: { unitId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    const result = await rentApartment(unitId);
    if (result.ok && result.data) {
      router.push(`/apartment/${result.data.id}`);
      router.refresh();
    } else {
      setError(result.ok ? "选位失败" : result.error);
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <p className="mb-1 text-xs text-red-600">{error}</p>}
      <Button type="button" size="sm" onClick={handleClick} disabled={loading}>
        {loading ? "入住中…" : "选此位"}
      </Button>
    </div>
  );
}

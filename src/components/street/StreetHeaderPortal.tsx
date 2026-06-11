"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { StreetContextHeader } from "@/components/street/StreetContextHeader";

type StreetHeaderPortalProps = {
  streetName: string;
  serviceChief?: {
    username: string;
    displayName: string | null;
  } | null;
};

export function StreetHeaderPortal({
  streetName,
  serviceChief,
}: StreetHeaderPortalProps) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSlot(document.getElementById("street-context-slot"));
    return () => setSlot(null);
  }, []);

  if (!slot) return null;

  return createPortal(
    <StreetContextHeader streetName={streetName} serviceChief={serviceChief} />,
    slot,
  );
}

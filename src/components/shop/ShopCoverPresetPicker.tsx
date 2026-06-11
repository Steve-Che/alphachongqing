"use client";

import Image from "next/image";
import { SHOP_COVER_PRESETS } from "@/lib/shop-decor";

export function ShopCoverPresetPicker({
  value,
  onChange,
  disabled,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-stone-500">或选择预设门头（点击应用）</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {SHOP_COVER_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(value === preset.url ? null : preset.url)}
            className={`overflow-hidden rounded border-2 transition ${
              value === preset.url
                ? "border-[#b84a2f] ring-2 ring-[#b84a2f]/30"
                : "border-stone-200 hover:border-stone-400"
            }`}
            title={preset.label}
          >
            <Image
              src={preset.url}
              alt={preset.label}
              width={80}
              height={60}
              className="h-14 w-full object-cover"
              unoptimized
            />
            <span className="block truncate bg-stone-50 px-1 py-0.5 text-[10px] text-stone-600">
              {preset.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

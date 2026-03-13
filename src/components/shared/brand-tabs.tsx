"use client";

import type { Brand } from "@/types/api";
import { cn } from "@/lib/utils/cn";

type BrandTabsProps = {
  brands: Brand[];
  activeBrandId: string;
  onChange: (brandId: string) => void;
};

export function BrandTabs({ brands, activeBrandId, onChange }: BrandTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {brands.map((brand) => (
        <button
          key={brand.id}
          type="button"
          onClick={() => onChange(brand.id)}
          className={cn(
            "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
            activeBrandId === brand.id
              ? "border-[#f28c28] bg-[#f28c28] text-[#10131a]"
              : "border-white/10 bg-[#101a2c] text-slate-300 hover:border-white/20 hover:text-white",
          )}
        >
          {brand.name}
        </button>
      ))}
    </div>
  );
}

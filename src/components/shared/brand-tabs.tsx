"use client";

import { Plus } from "lucide-react";
import type { Brand } from "@/types/api";
import { cn } from "@/lib/utils/cn";

type BrandTabsProps = {
  brands: Brand[];
  activeBrandId: string;
  onChange: (brandId: string) => void;
  showNewBrandAction?: boolean;
  onNewBrandClick?: () => void;
};

export function BrandTabs({
  brands,
  activeBrandId,
  onChange,
  showNewBrandAction = false,
  onNewBrandClick,
}: BrandTabsProps) {
  return (
    <div className="flex gap-2">
      {showNewBrandAction ? (
        <button
          type="button"
          onClick={onNewBrandClick}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#f28c28]/60 bg-[#f28c28]/12 px-4 py-2 text-sm font-medium text-[#ffb46a] transition-colors hover:border-[#f28c28] hover:bg-[#f28c28]/18 hover:text-[#ffd1a4]"
        >
          <Plus className="size-4" />
          <span>New Brand</span>
        </button>
      ) : null}

      <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
        {brands.map((brand) => (
          <button
            key={brand.id}
            type="button"
            onClick={() => onChange(brand.id)}
            className={cn(
              "shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
              activeBrandId === brand.id
                ? "border-[#f28c28] bg-[#f28c28] text-[#10131a]"
                : "border-white/10 bg-[#101a2c] text-slate-300 hover:border-white/20 hover:text-white",
            )}
          >
            {brand.name}
          </button>
        ))}
      </div>
    </div>
  );
}

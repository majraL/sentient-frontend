"use client";

import { Switch } from "@/components/ui/switch";

type SearchToggleProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
};

export function SearchToggle({ checked, onCheckedChange, label }: SearchToggleProps) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101a2c] px-3 py-2 text-sm text-slate-300">
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      <span>{label}</span>
    </label>
  );
}

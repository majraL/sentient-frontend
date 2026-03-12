import * as React from "react";
import { cn } from "@/lib/utils/cn";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return <table className={cn("w-full caption-bottom text-sm", className)} {...props} />;
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr className={cn("border-b border-white/6 hover:bg-white/[0.03]", className)} {...props} />;
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return <th className={cn("h-11 px-4 text-left font-medium text-slate-400", className)} {...props} />;
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-middle text-slate-200", className)} {...props} />;
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };

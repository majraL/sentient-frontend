import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/brands", label: "Brands" },
  { href: "/jobs", label: "Jobs" },
  { href: "/runs", label: "Runs" },
  { href: "/results", label: "Results" },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white">
      <div className="border-b p-4">
        <h1 className="text-lg font-semibold">Sentient</h1>
        <p className="text-sm text-muted-foreground">Analysis platform</p>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

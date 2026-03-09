export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <p className="text-sm text-muted-foreground">Tenant</p>
        <p className="font-medium">Acme Group</p>
      </div>

      <div className="text-sm text-muted-foreground">
        User menu placeholder
      </div>
    </header>
  );
}

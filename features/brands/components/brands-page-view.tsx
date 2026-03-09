export function BrandsPageView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Brands</h1>
        <p className="text-muted-foreground">
          Manage the brands that belong to the current tenant.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <p className="font-medium">Brands table will go here</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Later this will contain filters, search, row actions, and pagination.
        </p>
      </div>
    </div>
  );
}

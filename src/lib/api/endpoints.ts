export const endpoints = {
  auth: {
    login: "/auth/login",
    currentUser: "/auth/current-user",
  },
  dashboard: {
    brands: "/dashboard/brands",
    queryRows: "/dashboard/query-rows",
    results: "/dashboard/query-results",
  },
  configuration: {
    brands: "/configuration/brands",
    rows: "/configuration/rows",
  },
  runs: {
    list: "/runs",
    detail: "/runs/:id",
  },
  account: "/account",
  admin: {
    dashboard: "/admin/dashboard",
    clients: "/admin/clients",
    settings: "/admin/settings",
  },
} as const;

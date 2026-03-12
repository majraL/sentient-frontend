import { mockRequest } from "@/lib/api/client";
import { getAdminClients, getAdminDashboard, getAdminSettings, updateAdminSettings } from "@/lib/api/mock-db";
import type { AdminSettings } from "@/types/api";

export const adminApi = {
  getDashboard: () => mockRequest(() => getAdminDashboard()),
  getClients: () => mockRequest(() => getAdminClients()),
  getSettings: () => mockRequest(() => getAdminSettings()),
  updateSettings: (payload: AdminSettings) => mockRequest(() => updateAdminSettings(payload)),
};

"use client";

import { mockRequest } from "@/lib/api/client";
import { clearAllData, populateDemoData } from "@/lib/api/mock-db";

export const devToolsApi = {
  populateDemoData: () => mockRequest(() => populateDemoData()),
  clearAllData: () => mockRequest(() => clearAllData()),
};

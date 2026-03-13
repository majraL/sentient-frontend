import { mockRequest } from "@/lib/api/client";
import { getAccountProfile, updateAccountProfile } from "@/lib/api/mock-db";
import type { AccountProfileFormValues } from "@/types/api";

export const accountApi = {
  getProfile: () => mockRequest(() => getAccountProfile()),
  updateProfile: (payload: AccountProfileFormValues) =>
    mockRequest(() => updateAccountProfile(payload)),
};

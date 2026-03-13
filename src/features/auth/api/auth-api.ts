import { mockRequest } from "@/lib/api/client";
import { getCurrentUser, login } from "@/lib/api/mock-db";
import type { LoginPayload } from "@/types/api";

export function loginRequest(payload: LoginPayload) {
  return mockRequest(() => login(payload));
}

export function getCurrentUserRequest(email?: string) {
  return mockRequest(() => getCurrentUser(email));
}

import { apiClient } from "@/lib/api/client";
import type { BrandsResponse } from "../types/brand.types";

export function getBrands() {
  return apiClient<BrandsResponse>("/brands");
}

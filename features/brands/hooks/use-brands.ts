import { useQuery } from "@tanstack/react-query";
import { getBrands } from "../api/get-brands";

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });
}

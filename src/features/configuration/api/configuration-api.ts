import { mockRequest } from "@/lib/api/client";
import {
  createBrand,
  createBrandConfigRow,
  deleteBrandConfigRow,
  getBrandConfigRows,
  getBrands,
  saveBrandConfiguration,
  updateBrand,
  updateBrandConfigRow,
} from "@/lib/api/mock-db";
import type { BrandConfigRowFormValues, BrandFormValues } from "@/types/api";

export const configurationApi = {
  getBrands: () => mockRequest(() => getBrands()),
  getBrandConfigRows: (brandId: string) => mockRequest(() => getBrandConfigRows(brandId)),
  createBrand: (payload: BrandFormValues) => mockRequest(() => createBrand(payload)),
  updateBrand: (brandId: string, payload: BrandFormValues) =>
    mockRequest(() => updateBrand(brandId, payload)),
  createBrandConfigRow: (brandId: string, payload: BrandConfigRowFormValues) =>
    mockRequest(() => createBrandConfigRow(brandId, payload)),
  updateBrandConfigRow: (rowId: string, payload: BrandConfigRowFormValues) =>
    mockRequest(() => updateBrandConfigRow(rowId, payload)),
  deleteBrandConfigRow: (rowId: string) => mockRequest(() => deleteBrandConfigRow(rowId)),
  saveBrandConfiguration: (brandId: string) => {
    void brandId;
    return mockRequest(() => saveBrandConfiguration());
  },
};

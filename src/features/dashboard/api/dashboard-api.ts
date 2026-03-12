import { mockRequest } from "@/lib/api/client";
import {
  analyzeCompletedQueries,
  getDashboardBrands,
  getDashboardQueryRows,
  getQueryResults,
  runSelectedQueries,
  saveReport,
  updateManyQuerySelections,
  updateQuerySelection,
} from "@/lib/api/mock-db";

export const dashboardApi = {
  getBrands: () => mockRequest(() => getDashboardBrands()),
  getQueryRows: (brandId: string) => mockRequest(() => getDashboardQueryRows(brandId)),
  getQueryResults: (queryRowId: string) => mockRequest(() => getQueryResults(queryRowId)),
  updateSelection: (queryRowId: string, selected: boolean) =>
    mockRequest(() => updateQuerySelection(queryRowId, selected)),
  updateManySelections: (queryRowIds: string[], selected: boolean) =>
    mockRequest(() => updateManyQuerySelections(queryRowIds, selected)),
  runSelectedQueries: (brandId: string) => mockRequest(() => runSelectedQueries(brandId)),
  analyzeCompletedQueries: (brandId: string) => mockRequest(() => analyzeCompletedQueries(brandId)),
  saveReport: (brandId: string) => {
    void brandId;
    return mockRequest(() => saveReport());
  },
};

import { configurationApi } from "@/features/configuration/api/configuration-api";
import { runsApi } from "@/features/runs/api/runs-api";

export const resultsApi = {
  getRuns: runsApi.getRuns,
  getRunById: runsApi.getRunById,
  getRunResultTasks: runsApi.getRunResultTasks,
  getBrands: configurationApi.getBrands,
  getBrandConfigRows: configurationApi.getBrandConfigRows,
};

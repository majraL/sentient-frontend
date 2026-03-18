import { runsApi } from "@/features/runs/api/runs-api";

export const resultsApi = {
  getRuns: runsApi.getRuns,
  getRunById: runsApi.getRunById,
  getRunResultTasks: runsApi.getRunResultTasks,
};

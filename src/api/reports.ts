import api from "./axios";
import { normalizeReports } from "../components/types/report";
import type { AIWeeklyReport } from "../components/types/report";
import { getAuthToken } from "../utils/authToken";

export const fetchReportHistory = async (): Promise<AIWeeklyReport[]> => {
  const token = getAuthToken();
  const headers = { Authorization: `Bearer ${token}` };

  const response = await api.get("/reports/history", { headers });
  return normalizeReports(response.data);
};

export const generateWeeklyReport = async (): Promise<AIWeeklyReport[]> => {
  const token = getAuthToken();
  const headers = { Authorization: `Bearer ${token}` };

  await api.post("/reports/generate-test", {}, { headers });
  return fetchReportHistory();
};

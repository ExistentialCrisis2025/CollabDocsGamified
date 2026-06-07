import axios from "axios";
import api from "./axios";
import { normalizeReports } from "../components/types/report";
import type { AIWeeklyReport } from "../components/types/report";
import { getAuthToken } from "../utils/authToken";

const reportEndpoints = ["/reports/me", "/users/me/reports", "/weekly-reports/me"];

export const fetchReportHistory = async (): Promise<AIWeeklyReport[]> => {
  const token = getAuthToken();
  const headers = { Authorization: `Bearer ${token}` };

  for (const endpoint of reportEndpoints) {
    try {
      const response = await api.get(endpoint, { headers });
      return normalizeReports(response.data);
    } catch (error: unknown) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }
    }
  }

  return [];
};

import { useNavigate } from "react-router-dom";
import Kanban from "../components/Kanban";
import { useState } from "react";
import api from "../api/axios";
import { clearAuthToken, getAuthToken } from "../utils/authToken";

import type { Task } from "../components/types/types";
const Dashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    clearAuthToken();
    navigate("/");
  };

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  async function fetchDashboard() {
    try {
      setDashboardLoading(true);

      const token = getAuthToken();

      const response = await api.get("/users/me/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDashboardData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setDashboardLoading(false);
    }
  }

  const remainingTasks =
    dashboardData?.todays_tasks?.filter(
      (task: Task) => task.status !== "done",
    ) || [];

  return dashboardLoading ? (
    <div>Loading data</div>
  ) : (
    <div>
      <Kanban
        dashboardData={dashboardData}
        remainingTasks={remainingTasks}
        fetchDashboard={fetchDashboard}
      ></Kanban>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;

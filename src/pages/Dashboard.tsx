import { Navigate, useNavigate } from "react-router-dom";
import Kanban from "../components/Kanban";
import { useState } from "react";
import api from "../api/axios";

import type { Task } from "../components/types/types";
const Dashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.setItem("authToken", "");
    navigate("/");
  };

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  async function fetchDashboard() {
    try {
      setDashboardLoading(true);

      const token = localStorage.getItem("authToken");

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

  return (
    <div>
      <h1>This is the dashboard</h1>
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

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import Kanban from "../components/Kanban";
import TopBar from "../components/TopBar";
import { ArrowLeft } from "lucide-react";
import type { Task } from "../components/types/types";
import { getAuthToken } from "../utils/authToken";

const KanbanPage = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);

  async function fetchDashboard() {
    try {
      const token = getAuthToken();
      const response = await api.get("/users/me/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const remainingTasks = dashboardData?.todays_tasks?.filter((task: Task) => task.status !== "done") || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <TopBar />
      
      <motion.div 
        className="mx-auto max-w-7xl p-6 pt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="mb-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-indigo-500 font-medium hover:underline w-max">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </Link>
        </div>

        <Kanban dashboardData={dashboardData} remainingTasks={remainingTasks} fetchDashboard={fetchDashboard} />
      </motion.div>
    </div>
  );
};

export default KanbanPage;

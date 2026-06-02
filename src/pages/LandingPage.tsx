import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import AIReportCard from "../components/AIReportCard";
import { fetchReportHistory } from "../api/reports";
import type { AIWeeklyReport } from "../components/types/report";
import { shouldShowDashboardReport } from "../components/types/report";
import { Timer, LayoutDashboard, Trophy, BarChart3, LogOut } from "lucide-react";

type DashboardTask = {
  id: number | string;
  title: string;
  description?: string;
  priority?: "high" | "medium" | "low" | string;
  xp_reward?: number;
  status?: "todo" | "in_progress" | "done" | string;
};

type DashboardData = {
  completed_today?: boolean;
  tasks_completed_today?: number;
  todays_tasks?: DashboardTask[];
  user?: {
    username?: string;
    current_streak?: number;
    longest_streak?: number;
  };
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [latestReport, setLatestReport] = useState<AIWeeklyReport | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/users/me/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    async function fetchReports() {
      try {
        const reports = await fetchReportHistory();
        setLatestReport(reports[0] || null);
      } catch (error) {
        console.error("Failed to fetch AI reports", error);
      }
    }

    fetchDashboard();
    fetchReports();
  }, []);

  const handleLogout = () => {
    localStorage.setItem("token", "");
    navigate("/");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <TopBar />
      
      <motion.div 
        className="mx-auto max-w-5xl p-6 pt-12"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-xl transition-colors dark:border-rose-500/20 dark:bg-slate-800">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Current Streak</h2>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400">
                🔥
              </div>
            </div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">
              {dashboardData?.user?.current_streak || 0}
            </div>
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Longest: {dashboardData?.user?.longest_streak || 0} days
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-xl transition-colors dark:border-emerald-500/20 dark:bg-slate-800">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tasks Done Today</h2>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400">
                ⭐
              </div>
            </div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">
              {dashboardData?.tasks_completed_today || 0}
            </div>
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {dashboardData?.completed_today ? "🔥 Streak maintained" : "Complete a task today"}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-12 text-center">
          <h1 className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-5xl font-black text-slate-900 dark:text-white">
            <span>Welcome back,</span>
            <span className="inline-flex items-center gap-2">
              <span className="bg-gradient-to-r from-indigo-500 to-emerald-400 bg-clip-text text-transparent">
                {dashboardData?.user?.username || "User"}
              </span>
              <span aria-hidden="true">👋</span>
            </span>
          </h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            Select a module to continue your productivity journey.
          </p>
        </motion.div>

        {latestReport && shouldShowDashboardReport(latestReport) && (
          <motion.div variants={itemVariants} className="mb-12">
            <AIReportCard report={latestReport} />
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link to="/kanban" className="group relative flex min-h-[180px] flex-col overflow-hidden rounded-3xl bg-indigo-500 p-8 shadow-2xl transition hover:scale-105 active:scale-95">
            <div className="absolute -right-6 -top-6 rounded-full bg-white/20 p-8">
              <LayoutDashboard className="h-16 w-16 text-white" />
            </div>
            <div className="relative z-10 pr-16">
              <h2 className="text-2xl font-bold text-white leading-snug">Board & Tasks</h2>
              <p className="mt-2 text-indigo-100">Manage your tasks and earn XP.</p>
            </div>
          </Link>

          <Link to="/pomodoro" className="group relative flex min-h-[180px] flex-col overflow-hidden rounded-3xl bg-emerald-500 p-8 shadow-2xl transition hover:scale-105 active:scale-95">
            <div className="absolute -right-6 -top-6 rounded-full bg-white/20 p-8">
              <Timer className="h-16 w-16 text-white" />
            </div>
            <div className="relative z-10 pr-16">
              <h2 className="text-2xl font-bold text-white leading-snug">Pomodoro</h2>
              <p className="mt-2 text-emerald-100">Focus sessions and timed breaks.</p>
            </div>
          </Link>

          <Link to="/Analytics" className="group relative flex min-h-[180px] flex-col overflow-hidden rounded-3xl bg-sky-500 p-8 shadow-2xl transition hover:scale-105 active:scale-95">
            <div className="absolute -right-6 -top-6 rounded-full bg-white/20 p-8">
              <BarChart3 className="h-16 w-16 text-white" />
            </div>
            <div className="relative z-10 pr-16">
              <h2 className="text-2xl font-bold text-white leading-snug">Analytics</h2>
              <p className="mt-2 text-sky-100">Trends, productivity, and progress.</p>
            </div>
          </Link>

          <Link to="/leaderboard" className="group relative flex min-h-[180px] flex-col overflow-hidden rounded-3xl bg-amber-500 p-8 shadow-2xl transition hover:scale-105 active:scale-95 md:col-start-1 md:row-start-2">
            <div className="absolute -right-6 -top-6 rounded-full bg-white/20 p-8">
              <Trophy className="h-16 w-16 text-white" />
            </div>
            <div className="relative z-10 pr-16">
              <h2 className="text-2xl font-bold text-white leading-snug break-words">Leaderboard</h2>
              <p className="mt-2 text-amber-100">See weekly top performers.</p>
            </div>
          </Link>
        </motion.div>

        {/* Today's Tasks Section */}
        <motion.div variants={itemVariants} className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl transition-colors dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Today's Tasks</h2>
          {!dashboardData?.todays_tasks || dashboardData.todays_tasks.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No tasks for today. You're all caught up!</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {dashboardData.todays_tasks.map((task: DashboardTask) => (
                <div key={task.id} className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-700/50 dark:bg-slate-800/50 transition hover:border-indigo-300 dark:hover:border-indigo-500/50">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{task.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        task.priority === 'high' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' :
                        task.priority === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                        'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                      }`}>
                        {task.priority || 'medium'}
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                        ⭐ {task.xp_reward || 0} XP
                      </span>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider sm:ml-auto ${
                      task.status === 'done' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' :
                      'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {(task.status || 'todo').replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="mt-12 text-center">
            <button onClick={handleLogout} className="flex mx-auto items-center gap-2 rounded-full border border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-6 py-3 text-rose-500 font-bold transition hover:bg-rose-500 hover:text-white">
                <LogOut className="h-5 w-5" /> Logout
            </button>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default LandingPage;

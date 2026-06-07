import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import { useThemeStore } from "../store/themeStore";
import { Activity, ArrowLeft, BarChart3, CalendarCheck2, TrendingUp } from "lucide-react";
import { getAuthToken } from "../utils/authToken";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

type TaskAnalytics = {
  date: string;
  tasks: number;
};

type XPAnalytics = {
  date: string;
  xp: number;
};

type RawTaskAnalytics = {
  completion_date: string;
  tasks_completed: string | number;
};

type RawXPAnalytics = {
  day: string;
  total_xp: string | number;
};

type RawHourAnalytics = {
  hour: string | number;
  count: string | number;
};

type AnalyticsResponse = {
  tasksPerDay?: RawTaskAnalytics[];
  xpOverTime?: RawXPAnalytics[];
  productiveHours?: RawHourAnalytics[];
};

const StatCard = ({
  icon,
  label,
  value,
  caption,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  caption: string;
  tone: "indigo" | "emerald" | "amber";
}) => {
  const tones = {
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    amber: "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-5 flex items-center gap-3">
        <div className={`rounded-xl border p-3 ${tones[tone]}`}>{icon}</div>
        <div>
          <h2 className="font-black text-slate-900 dark:text-white">{label}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{caption}</p>
        </div>
      </div>
      <div className="break-words text-4xl font-black text-slate-950 dark:text-white">
        {value}
      </div>
    </div>
  );
};

const Analytics = () => {
  const { isDark } = useThemeStore();
  const [loading, setLoading] = useState(true);
  const [taskAnalytics, setTaskAnalytics] = useState<TaskAnalytics[]>([]);
  const [xpAnalytics, setXPAnalytics] = useState<XPAnalytics[]>([]);
  const [hourAnalytics, setHourAnalytics] = useState<number[]>(Array(24).fill(0));

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const token = getAuthToken();
        const response = await api.get<AnalyticsResponse>("/analytics/overview", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const taskData = (response.data.tasksPerDay || []).map((item) => ({
          date: new Date(item.completion_date).toLocaleDateString(),
          tasks: Number(item.tasks_completed),
        }));

        const xpData = (response.data.xpOverTime || []).map((item) => ({
          date: new Date(item.day).toLocaleDateString(),
          xp: Number(item.total_xp),
        }));

        const hourData = Array(24).fill(0);
        if (response.data.productiveHours) {
          response.data.productiveHours.forEach((item) => {
            const hour = Number(item.hour);
            if (hour >= 0 && hour < 24) {
              hourData[hour] = Number(item.count);
            }
          });
        }

        setTaskAnalytics(taskData);
        setXPAnalytics(xpData);
        setHourAnalytics(hourData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const totalTasks = taskAnalytics.reduce((sum, entry) => sum + entry.tasks, 0);
  const totalXp = xpAnalytics.reduce((sum, entry) => sum + entry.xp, 0);
  const mostActiveDay =
    taskAnalytics.length > 0
      ? taskAnalytics.reduce((max, entry) =>
          entry.tasks > max.tasks ? entry : max,
        ).date
      : "N/A";

  const chartTextColor = isDark ? "#e2e8f0" : "#475569";
  const chartGridColor = isDark
    ? "rgba(148, 163, 184, 0.14)"
    : "rgba(100, 116, 139, 0.16)";

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: chartTextColor,
            font: {
              size: 13,
              weight: "bold" as const,
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: chartTextColor },
          grid: { color: chartGridColor },
        },
        y: {
          ticks: { color: chartTextColor },
          grid: { color: chartGridColor },
        },
      },
    }),
    [chartGridColor, chartTextColor],
  );

  const taskChartData = {
    labels: taskAnalytics.map((entry) => entry.date),
    datasets: [
      {
        label: "Tasks Completed",
        data: taskAnalytics.map((entry) => entry.tasks),
        backgroundColor: "rgba(99, 102, 241, 0.78)",
        borderRadius: 10,
      },
    ],
  };

  const xpChartData = {
    labels: xpAnalytics.map((entry) => entry.date),
    datasets: [
      {
        label: "XP Over Time",
        data: xpAnalytics.map((entry) => entry.xp),
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgba(16, 185, 129, 1)",
        pointBorderColor: isDark ? "#0f172a" : "#ffffff",
        pointRadius: 5,
      },
    ],
  };

  const hourChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: "Tasks Completed by Hour",
        data: hourAnalytics,
        backgroundColor: "rgba(245, 158, 11, 0.78)",
        borderRadius: 10,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <TopBar />

      <motion.main
        className="mx-auto max-w-6xl p-6 pt-12"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Link
          to="/dashboard"
          className="mb-8 flex w-max items-center gap-2 font-bold text-indigo-500 transition hover:text-indigo-600 dark:text-indigo-300"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Link>

        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black uppercase text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                <BarChart3 className="h-4 w-4" />
                Productivity trends
              </div>
              <h1 className="text-4xl font-black leading-tight text-slate-950 dark:text-white sm:text-5xl">
                Analytics
              </h1>
              <p className="mt-4 max-w-2xl text-slate-500 dark:text-slate-400">
                Track completed tasks, XP growth, and your most productive days
                from one focused view.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-300" />
                <div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-300">
                    {totalXp}
                  </div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Total XP tracked
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center font-bold text-slate-500 shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Loading analytics...
          </div>
        ) : (
          <>
            <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard
                icon={<CalendarCheck2 className="h-7 w-7" />}
                label="Tasks Completed"
                value={totalTasks}
                caption="Across the tracked range"
                tone="indigo"
              />
              <StatCard
                icon={<TrendingUp className="h-7 w-7" />}
                label="XP Earned"
                value={totalXp}
                caption="Total growth"
                tone="emerald"
              />
              <StatCard
                icon={<Activity className="h-7 w-7" />}
                label="Most Active Day"
                value={mostActiveDay}
                caption="Highest productivity"
                tone="amber"
              />
            </section>

            <section className="space-y-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Tasks Completed Per Day
                  </h2>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Daily productivity consistency
                  </p>
                </div>
                <div className="h-[320px]">
                  <Bar data={taskChartData} options={chartOptions} />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    XP Growth Over Time
                  </h2>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Track your progression journey
                  </p>
                </div>
                <div className="h-[320px]">
                  <Line data={xpChartData} options={chartOptions} />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Most Productive Hours
                  </h2>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Heatmap of your most active times of day
                  </p>
                </div>
                <div className="h-[320px]">
                  <Bar data={hourChartData} options={chartOptions} />
                </div>
              </div>
            </section>
          </>
        )}
      </motion.main>
    </div>
  );
};

export default Analytics;

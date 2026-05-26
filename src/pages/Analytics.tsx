import { useEffect, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";

import { BarChart3, TrendingUp, Activity } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

type TaskAnalytics = {
  date: string;
  tasks: number;
};

type XPAnalytics = {
  date: string;
  xp: number;
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);

  const [taskAnalytics, setTaskAnalytics] = useState<TaskAnalytics[]>([]);

  const [xpAnalytics, setXPAnalytics] = useState<XPAnalytics[]>([]);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);

        setTaskAnalytics([
          { date: "Mon", tasks: 4 },
          { date: "Tue", tasks: 7 },
          { date: "Wed", tasks: 5 },
          { date: "Thu", tasks: 8 },
          { date: "Fri", tasks: 6 },
          { date: "Sat", tasks: 3 },
          { date: "Sun", tasks: 9 },
        ]);

        setXPAnalytics([
          { date: "Mon", xp: 50 },
          { date: "Tue", xp: 120 },
          { date: "Wed", xp: 180 },
          { date: "Thu", xp: 260 },
          { date: "Fri", xp: 340 },
          { date: "Sat", xp: 390 },
          { date: "Sun", xp: 470 },
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading analytics...
      </div>
    );
  }

  const taskChartData = {
    labels: taskAnalytics.map((entry) => entry.date),

    datasets: [
      {
        label: "Tasks Completed",

        data: taskAnalytics.map((entry) => entry.tasks),

        backgroundColor: "rgba(250, 204, 21, 0.7)",

        borderRadius: 12,
      },
    ],
  };

  const xpChartData = {
    labels: xpAnalytics.map((entry) => entry.date),

    datasets: [
      {
        label: "XP Over Time",

        data: xpAnalytics.map((entry) => entry.xp),

        borderColor: "rgba(249, 115, 22, 1)",

        backgroundColor: "rgba(249, 115, 22, 0.2)",

        tension: 0.4,

        fill: true,

        pointBackgroundColor: "rgba(249, 115, 22, 1)",

        pointBorderColor: "#fff",

        pointRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,

    plugins: {
      legend: {
        labels: {
          color: "white",
          font: {
            size: 14,
            weight: "bold" as const,
          },
        },
      },
    },

    scales: {
      x: {
        ticks: {
          color: "white",
        },

        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },

      y: {
        ticks: {
          color: "white",
        },

        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-10">
      <div className="mb-10">
        <h1
          className="
                  bg-linear-to-r
                  from-yellow-400
                  to-orange-500
                  bg-clip-text
                  text-5xl
                  font-black
                  text-transparent
               "
        >
          Productivity Analytics
        </h1>

        <p className="mt-3 text-zinc-400">
          Track your progress and productivity trends.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          className="
                  rounded-2xl
                  border border-yellow-500/30
                  bg-zinc-900/80
                  p-6 shadow-xl
               "
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className="
                        rounded-xl
                        bg-yellow-500/20
                        p-3
                     "
            >
              <BarChart3 className="h-7 w-7 text-yellow-400" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">Tasks Completed</h2>

              <p className="text-sm text-zinc-400">This week</p>
            </div>
          </div>

          <div className="text-4xl font-black text-white">
            {taskAnalytics.reduce((sum, entry) => sum + entry.tasks, 0)}
          </div>
        </div>

        <div
          className="
                  rounded-2xl
                  border border-orange-500/30
                  bg-zinc-900/80
                  p-6 shadow-xl
               "
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className="
                        rounded-xl
                        bg-orange-500/20
                        p-3
                     "
            >
              <TrendingUp className="h-7 w-7 text-orange-400" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">XP Earned</h2>

              <p className="text-sm text-zinc-400">Total growth</p>
            </div>
          </div>

          <div className="text-4xl font-black text-white">
            {xpAnalytics[xpAnalytics.length - 1]?.xp || 0}
          </div>
        </div>

        <div
          className="
                  rounded-2xl
                  border border-green-500/30
                  bg-zinc-900/80
                  p-6 shadow-xl
               "
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className="
                        rounded-xl
                        bg-green-500/20
                        p-3
                     "
            >
              <Activity className="h-7 w-7 text-green-400" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">Most Active Day</h2>

              <p className="text-sm text-zinc-400">Highest productivity</p>
            </div>
          </div>

          <div className="text-4xl font-black text-white">
            {
              taskAnalytics.reduce(
                (max, entry) => (entry.tasks > max.tasks ? entry : max),
                taskAnalytics[0],
              )?.date
            }
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div
          className="
                  rounded-2xl
                  border border-zinc-700
                  bg-zinc-900/80
                  p-6 shadow-xl
               "
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">
              Tasks Completed Per Day
            </h2>

            <p className="mt-2 text-zinc-400">Daily productivity consistency</p>
          </div>

          <Bar data={taskChartData} options={chartOptions} />
        </div>

        <div
          className="
                  rounded-2xl
                  border border-zinc-700
                  bg-zinc-900/80
                  p-6 shadow-xl
               "
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">
              XP Growth Over Time
            </h2>

            <p className="mt-2 text-zinc-400">Track your progression journey</p>
          </div>

          <Line data={xpChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;

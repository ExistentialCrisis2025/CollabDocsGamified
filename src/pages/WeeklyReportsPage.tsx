import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BrainCircuit, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import AIReportCard from "../components/AIReportCard";
import TopBar from "../components/TopBar";
import { fetchReportHistory, generateWeeklyReport } from "../api/reports";
import type { AIWeeklyReport } from "../components/types/report";

const WeeklyReportsPage = () => {
  const [reports, setReports] = useState<AIWeeklyReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportGenerating, setReportGenerating] = useState(false);
  const latestReport = reports[0];

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      setReportsLoading(true);
      const reportHistory = await fetchReportHistory();
      setReports(reportHistory);
    } catch (error) {
      console.error("Failed to fetch AI reports", error);
    } finally {
      setReportsLoading(false);
    }
  }

  async function refreshWeeklyReport() {
    try {
      setReportGenerating(true);
      const reportHistory = await generateWeeklyReport();
      setReports(reportHistory);
      toast.success("Weekly report refreshed");
    } catch (error) {
      console.error("Failed to generate AI report", error);
      toast.error("Failed to refresh weekly report");
    } finally {
      setReportGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <TopBar />

      <motion.div
        className="mx-auto max-w-4xl p-6 pt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link to="/dashboard" className="mb-8 flex w-max items-center gap-2 font-medium text-indigo-500 hover:underline">
          <ArrowLeft className="h-5 w-5" /> Back to Dashboard
        </Link>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black uppercase text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI coach history
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">Weekly Reports</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Weekly AI summaries generated from your last 7 days of completed tasks and XP momentum.
            </p>
          </div>

          <button
            onClick={refreshWeeklyReport}
            disabled={reportGenerating}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${reportGenerating ? "animate-spin" : ""}`} />
            {reportGenerating ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {reportsLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center font-bold text-slate-500 shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Loading AI reports...
          </div>
        ) : latestReport ? (
          <div>
            <AIReportCard report={latestReport} />
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300">
              <BrainCircuit className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">No reports yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Once the weekly AI report job runs, your generated report history will appear here.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WeeklyReportsPage;

import { BrainCircuit, CalendarDays, ChevronRight, Sparkles, Target, TrendingUp } from "lucide-react";
import type { AIWeeklyReport } from "./types/report";

type AIReportCardProps = {
  report: AIWeeklyReport;
  compact?: boolean;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const ReportList = ({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "emerald" | "sky" | "amber";
}) => {
  if (!items.length) return null;

  const toneClasses = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    sky: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300",
    amber: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <h4 className="mb-3 text-sm font-black uppercase">{title}</h4>
      <div className="space-y-2">
        {items.slice(0, 3).map((item, index) => (
          <div key={`${title}-${index}`} className="flex gap-2 text-sm leading-relaxed">
            <ChevronRight className="mt-0.5 h-4 w-4 flex-none" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AIReportCard = ({ report, compact = false }: AIReportCardProps) => {
  const dateRange = [formatDate(report.weekStart), formatDate(report.weekEnd)]
    .filter(Boolean)
    .join(" - ");

  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-amber-400" />
      <div className="relative p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-slate-900 text-cyan-300 shadow-lg shadow-cyan-500/20 dark:bg-white dark:text-indigo-600">
              <BrainCircuit className="h-7 w-7" />
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black uppercase text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Weekly Report
                </span>
                {dateRange && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {dateRange}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black leading-tight text-slate-950 dark:text-white sm:text-3xl">
                {report.title}
              </h2>
            </div>
          </div>

          {report.score && (
            <div className="flex min-w-[96px] items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-center dark:border-indigo-500/20 dark:bg-indigo-500/10">
              <div>
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-300">
                  {report.score}
                </div>
                <div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  Score
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
          {report.summary}
        </p>

        {report.focus && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">
                Next focus
              </div>
              <div className="font-bold text-slate-900 dark:text-white">{report.focus}</div>
            </div>
          </div>
        )}

        {!compact && (
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ReportList title="Wins" items={report.wins} tone="emerald" />
            <ReportList title="Opportunities" items={report.opportunities} tone="sky" />
            <ReportList title="Next steps" items={report.nextSteps} tone="amber" />
          </div>
        )}

        {compact && report.nextSteps.length > 0 && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
            <TrendingUp className="mt-0.5 h-5 w-5 flex-none" />
            <span className="text-sm font-semibold leading-6">{report.nextSteps[0]}</span>
          </div>
        )}
      </div>
    </article>
  );
};

export default AIReportCard;

export type AIWeeklyReport = {
  id: string;
  weekStart?: string;
  weekEnd?: string;
  createdAt?: string;
  title: string;
  summary: string;
  wins: string[];
  opportunities: string[];
  nextSteps: string[];
  focus?: string;
  score?: number;
};

type ReportLike = Record<string, unknown>;

const asRecord = (value: unknown): ReportLike =>
  typeof value === "object" && value !== null ? (value as ReportLike) : {};

const asArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\n|;/)
      .map((item) => item.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);
  }

  return [];
};

const parseReportPayload = (report: ReportLike): ReportLike => {
  const payload =
    report.report ||
    report.response ||
    report.content ||
    report.ai_response ||
    report.report_json ||
    report.data ||
    {};

  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload);
      return typeof parsed === "object" && parsed !== null
        ? parsed
        : { summary: payload };
    } catch {
      return { summary: payload };
    }
  }

  return asRecord(payload);
};

const firstString = (...values: unknown[]) => {
  const value = values.find(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );

  return value?.trim();
};

export const normalizeReport = (report: ReportLike): AIWeeklyReport => {
  const payload = parseReportPayload(report);
  const id = String(
    report.id ||
      report.report_id ||
      `${report.week_start || payload.week_start || "report"}-${
        report.created_at || payload.created_at || Date.now()
      }`,
  );

  return {
    id,
    weekStart: firstString(
      report.week_start,
      report.weekStart,
      payload.week_start,
      payload.weekStart,
    ),
    weekEnd: firstString(
      report.week_end,
      report.weekEnd,
      payload.week_end,
      payload.weekEnd,
    ),
    createdAt: firstString(
      report.created_at,
      report.createdAt,
      payload.created_at,
      payload.createdAt,
    ),
    title:
      firstString(report.title, payload.title, payload.headline) ||
      "Weekly AI Report",
    summary:
      firstString(
        report.summary,
        payload.summary,
        payload.executive_summary,
        payload.overview,
        payload.message,
      ) || "Your weekly productivity report is ready.",
    wins: asArray(
      payload.wins ||
        payload.highlights ||
        payload.achievements ||
        report.wins ||
        report.highlights,
    ),
    opportunities: asArray(
      payload.opportunities ||
        payload.improvements ||
        payload.risks ||
        payload.watchouts ||
        report.opportunities,
    ),
    nextSteps: asArray(
      payload.next_steps ||
        payload.nextSteps ||
        payload.recommendations ||
        payload.actions ||
        report.next_steps,
    ),
    focus: firstString(payload.focus, payload.focus_area, report.focus),
    score: Number(payload.score || report.score) || undefined,
  };
};

export const normalizeReports = (data: unknown): AIWeeklyReport[] => {
  const record = asRecord(data);
  const reports = Array.isArray(data)
    ? data
    : record.reports || record.weekly_reports || record.history || [];

  return (Array.isArray(reports) ? reports : [])
    .map((report) => normalizeReport(asRecord(report)))
    .sort((a: AIWeeklyReport, b: AIWeeklyReport) => {
      const bTime = Date.parse(b.createdAt || b.weekEnd || b.weekStart || "");
      const aTime = Date.parse(a.createdAt || a.weekEnd || a.weekStart || "");
      return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
    });
};

export const shouldShowDashboardReport = (report?: AIWeeklyReport) => {
  if (!report) return false;

  const now = new Date();
  const isMondayMorning = now.getDay() === 1 && now.getHours() < 12;
  const created = Date.parse(report.createdAt || "");
  const generatedToday =
    !Number.isNaN(created) &&
    new Date(created).toDateString() === now.toDateString();

  return isMondayMorning || generatedToday;
};

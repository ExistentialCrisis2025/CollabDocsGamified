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

const cleanReportText = (value: unknown) =>
  String(value || "")
    .replace(/\*\*/g, "")
    .replace(/^[\s#*-]+/gm, "")
    .replace(/\s+/g, " ")
    .trim();

const asArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(cleanReportText).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\n|;/)
      .map(cleanReportText)
      .filter(Boolean);
  }

  return [];
};

const parseTextReport = (text: string): ReportLike => {
  const headingPattern =
    /\*{0,2}\s*(?:\d+\.\s*)?(Summary|What went well|Areas to improve|Next week goal|Next steps|Wins|Opportunities)\s*\*{0,2}\s*:?\s*/gi;
  const matches = Array.from(text.matchAll(headingPattern));

  if (!matches.length) {
    return { summary: cleanReportText(text) };
  }

  const parsed: ReportLike = {};

  matches.forEach((match, index) => {
    const heading = String(match[1]).toLowerCase();
    const start = (match.index || 0) + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    const content = cleanReportText(text.slice(start, end));

    if (!content) return;

    if (heading === "summary") parsed.summary = content;
    if (heading === "what went well" || heading === "wins") parsed.wins = [content];
    if (heading === "areas to improve" || heading === "opportunities") {
      parsed.opportunities = [content];
    }
    if (heading === "next week goal" || heading === "next steps") {
      parsed.next_steps = [content];
      parsed.focus = content;
    }
  });

  return Object.keys(parsed).length ? parsed : { summary: cleanReportText(text) };
};

const parseReportPayload = (report: ReportLike): ReportLike => {
  const payload =
    report.report ||
    report.report_text ||
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
        : parseTextReport(payload);
    } catch {
      return parseTextReport(payload);
    }
  }

  return asRecord(payload);
};

const firstString = (...values: unknown[]) => {
  const value = values.find(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );

  return cleanReportText(value);
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

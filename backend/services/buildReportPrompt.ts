export function buildPrompt(
  stats: any
) {

  return `
You are a productivity coach.

User stats:

Report Period:
${stats.week_start} to ${stats.week_end}

Current Streak:
${stats.current_streak}

Tasks Completed This Week:
${stats.tasks_completed}

XP Earned This Week:
${stats.weekly_xp}

Return a polished plain-text report with these exact section labels:

Summary:
What went well:
Areas to improve:
Next week goal:

Do not use markdown, asterisks, numbered headings, bullets, or emoji.
Write each section in clear professional sentences.

Keep under 250 words.
`;
}

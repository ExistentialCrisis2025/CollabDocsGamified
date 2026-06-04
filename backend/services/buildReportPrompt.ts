export function buildPrompt(
  stats: any
) {

  return `
You are a productivity coach.

User stats:

Level:
${stats.level}

Total XP:
${stats.total_xp}

Current Streak:
${stats.current_streak}

Tasks Completed:
${stats.tasks_completed}

Write:

1. Summary
2. What went well
3. Areas to improve
4. Next week goal

Keep under 250 words.
`;
}
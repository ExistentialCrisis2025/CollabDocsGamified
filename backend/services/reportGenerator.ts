import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function generateReport(
  prompt: string
): Promise<string> {
  try {
    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

    const result =
      await model.generateContent(
        prompt
      );

    const text =
      result.response.text();

    if (!text || text.trim() === "") {
      throw new Error(
        "Empty response from Gemini"
      );
    }

    return text;

  } catch (err: any) {

    console.error(
      "[Gemini Failed]",
      err.message
    );

    return `
Weekly Productivity Report

You made steady progress this week.

Your activity shows consistent engagement with the platform and continued progress toward your goals.

Keep maintaining your streak and continue completing tasks regularly to maximize XP gains.

Focus on completing high-priority tasks first and try to improve consistency during less productive periods.

Goal for next week:
Complete more tasks than this week while maintaining your current streak.

Keep building momentum and stay focused!
`.trim();
  }
}
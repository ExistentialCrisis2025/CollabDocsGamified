import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  due_date: z.string().optional(),
  xp_reward: z.number().min(0).max(1000).optional(),
  status: z.enum(["todo", "in-progress", "done"]).optional(),
  position: z.number().min(0).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    "todo",
    "in-progress",
    "done",
  ]),
});
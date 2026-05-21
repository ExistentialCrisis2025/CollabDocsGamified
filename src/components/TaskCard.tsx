import React from "react";

import type { Status, Task } from "./types/types";

type prop = {
  task: Task;
  removeTask: (task_id: number) => void;
  updateTaskStatus: (task_id: number, task_status: Status) => void;
};

const TaskCard = (Prop: prop) => {
  const taskStatus = Prop.task.status;

  const statuses: Status[] = ["todo", "in-progress", "done"];

  const statusNeeded = statuses.filter((stat) => stat !== taskStatus);

  const priorityColors = {
    high: "bg-red-500/20 text-red-300 border-red-500/40",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    low: "bg-green-500/20 text-green-300 border-green-500/40",
  };

  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-800/90 p-5 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-zinc-500 hover:shadow-2xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-white">{Prop.task.title}</h2>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
            priorityColors[Prop.task.priority]
          }`}
        >
          {Prop.task.priority}
        </span>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-zinc-300">
        {Prop.task.description}
      </p>

      <div className="mb-4 flex items-center justify-between text-sm text-zinc-400">
        <span>⚡ {Prop.task.xp_reward} XP</span>

        <span>{new Date(Prop.task.due_date).toLocaleDateString()}</span>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {statusNeeded.map((stat) => (
          <button
            key={stat}
            onClick={() => Prop.updateTaskStatus(Prop.task.task_id, stat)}
            className="rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-600"
          >
            Move to {stat}
          </button>
        ))}
      </div>

      <button
        onClick={() => Prop.removeTask(Prop.task.task_id)}
        className="w-full rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-600"
      >
        Delete
      </button>
    </div>
  );
};
export default TaskCard;

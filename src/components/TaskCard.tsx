import React from "react";

import type { Status, Task } from "./types/types";
import { Draggable } from "@hello-pangea/dnd";

type prop = {
  task: Task;
  removeTask: (task_id: number) => void;
  updateTaskStatus: (task_id: number, task_status: Status) => void;
  index: number;
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
    <Draggable draggableId={String(Prop.task.id)} index={Prop.index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          className={`
        rounded-2xl
        border
        border-zinc-700
        bg-zinc-800/90
        p-5
        shadow-lg
        transition-colors
        duration-200
        hover:border-zinc-500
        hover:shadow-2xl
        ${snapshot.isDragging ? "ring-2 ring-yellow-400 shadow-2xl" : ""}
      `}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-white">{Prop.task.title}</h2>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                priorityColors[Prop.task.priority] || priorityColors.medium
              }`}
            >
              {Prop.task.priority || "medium"}
            </span>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-zinc-300">
            {Prop.task.description}
          </p>

          <div className="mb-4 flex items-center justify-between text-sm text-zinc-400">
            <span>⚡ {Prop.task.xp_reward || 0} XP</span>

            <span>
              {Prop.task.due_date
                ? new Date(Prop.task.due_date).toLocaleDateString()
                : "No Due Date"}
            </span>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {statusNeeded.map((stat) => (
              <button
                key={stat}
                onClick={() => Prop.updateTaskStatus(Prop.task.id, stat)}
                className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-yellow-500 hover:text-black"
              >
                Move to {stat}
              </button>
            ))}
          </div>

          <button
            onClick={() => Prop.removeTask(Prop.task.id)}
            className="mt-2 w-full rounded-lg bg-red-500/10 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white"
          >
            Delete
          </button>
        </div>
      )}
    </Draggable>
  );
};
export default TaskCard;

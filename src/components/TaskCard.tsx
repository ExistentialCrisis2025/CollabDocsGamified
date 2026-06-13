import type { Status, Task } from "./types/types";
import { Draggable } from "@hello-pangea/dnd";

type prop = {
  task: Task;
  removeTask: (id: number) => void;
  updateTaskStatus: (id: number, task_status: Status) => void;
  index: number;
};

import { useNavigate } from "react-router-dom";

const TaskCard = (Prop: prop) => {
  const navigate = useNavigate();
  const taskStatus = Prop.task.status;

  const statuses: Status[] = ["todo", "in-progress", "done"];

  const statusNeeded = statuses.filter((stat) => stat !== taskStatus);

  const priorityColors = {
    high: "bg-red-500/20 text-red-300 border-red-500/40",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    low: "bg-green-500/20 text-green-300 border-green-500/40",
  };

  const handleFocus = () => {
    navigate("/pomodoro", {
      state: { taskId: Prop.task.id, taskTitle: Prop.task.title },
    });
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
          rounded-2xl border border-zinc-700
          bg-zinc-800/90 p-5 shadow-lg
          transition-all duration-200
          hover:-translate-y-1
          hover:border-zinc-500
          hover:shadow-2xl

          ${
            snapshot.isDragging
              ? `
                    rotate-1
                    scale-105
                    border-yellow-400
                    shadow-[0_15px_40px_rgba(250,204,21,0.25)]
                    ring-2
                    ring-yellow-400/40
                  `
              : ""
          }
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

          <div className="flex gap-2 w-full">
            <div className="mb-3 flex flex-wrap gap-2 flex-1">
              {statusNeeded.map((stat) => (
                <button
                  key={stat}
                  onClick={() => Prop.updateTaskStatus(Prop.task.id, stat)}
                  className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-yellow-500 hover:text-black w-full text-center"
                >
                  Move to {stat}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 w-1/3">
              <button
                onClick={() => Prop.removeTask(Prop.task.id)}
                className="w-full rounded-lg bg-red-500/10 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white"
              >
                Delete
              </button>

              <button
                onClick={handleFocus}
                className="w-full rounded-lg bg-indigo-500/20 py-1.5 text-xs font-medium text-indigo-400 transition hover:bg-indigo-500 hover:text-white"
              >
                Focus
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
export default TaskCard;

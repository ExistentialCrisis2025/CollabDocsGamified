import "../index.css";
import TaskCard from "./TaskCard";

import type { Status, Task } from "./types/types";

type props = {
  title: Status;
  tasks: Task[];
  removeTask: (task_id: number) => void;
  updateTaskStatus: (task_id: number, task_status: Status) => void;
};

const KanbanColumn = (Props: props) => {
  const ColumnStyles = {
    todo: {
      header: "from-blue-600 to-blue-400",
      border: "border-blue-400/40",
    },

    "in-progress": {
      header: "from-yellow-500 to-amber-400",
      border: "border-yellow-400/40",
    },

    done: {
      header: "from-green-600 to-emerald-400",
      border: "border-green-400/40",
    },
  };

  return (
    <div
      className={`flex min-h-[600px] flex-col rounded-2xl border bg-zinc-900/80 p-4 shadow-2xl backdrop-blur-sm ${ColumnStyles[Props.title].border}`}
    >
      <div
        className={`mb-4 rounded-xl bg-gradient-to-r p-4 text-center text-lg font-bold uppercase tracking-wide text-white ${ColumnStyles[Props.title].header}`}
      >
        {Props.title.replace("-", " ")}
      </div>

      <div className="flex flex-1 flex-col gap-4">
        {Props.tasks.map((task) => (
          <TaskCard
            removeTask={Props.removeTask}
            key={task.task_id}
            task={task}
            updateTaskStatus={Props.updateTaskStatus}
          />
        ))}

        {Props.tasks.length === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-500">
            No tasks here
          </div>
        )}
      </div>
    </div>
  );
};
export default KanbanColumn;

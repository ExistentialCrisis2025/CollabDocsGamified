export type Item = {
  id: string;
  content: string;
};

export type Column = {
  name: string;
  items: Item[];
};

export type DraggedItem = {
  columnID: string;
  item: Item;
};

export type Priority = "low" | "medium" | "high";

export type Status = "todo" | "in-progress" | "done";

export type Task = {
  user_id: number;
  task_id: number;
  title: string;
  description: string;
  priority: Priority;
  due_date: string;
  xp_reward: number;
  status: Status;
};

export type newTask = {
  title: string;
  description: string;
  priority: Priority;
  due_date: string;
  xp_reward: number;
  status: Status;
};

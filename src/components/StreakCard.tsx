import React from "react";
import { Flame } from "lucide-react";

type Props = {
  currentStreak: number;
  longestStreak: number;
};
const StreakCard = (prop: Props) => {
  return (
    <Flame
      color={prop.currentStreak > 0 ? "text-orange-500" : "text-zinc-500"}
    />
  );
};

export default StreakCard;

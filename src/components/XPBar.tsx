import React from "react";

type Props = {
  totalXP: number;
  level: number;
  nextLevelXP: number;
};

const XPBar = (prop: Props) => {
  const percentage = Math.min(100, (prop.totalXP / prop.nextLevelXP) * 100);

  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-gray-900 rounded-lg shadow-2xl border border-gray-700">
      <div className="flex justify-between items-center mb-2 text-white font-bold">
        <span className="text-yellow-400 text-lg">Level {prop.level}</span>
        <span className="text-sm text-gray-400">
          {prop.totalXP} / {prop.nextLevelXP} XP
        </span>
      </div>

      <div className="relative w-full h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
        <div
          className="h-full bg-linear-to-r from-cyan-500 to-blue-600 transition-all duration-500 ease-out rounded-full shadow-inner"
          style={{ width: `${percentage}%` }}
        />

        <div
          className="absolute top-0 bottom-0 right-0 w-4 bg-white opacity-20 filter blur-sm"
          style={{ width: `${percentage > 0 ? 4 : 0}px` }}
        />
      </div>

      <div className="mt-1 text-right text-xs text-gray-500">
        {percentage.toFixed(0)}% to Level {prop.level + 1}
      </div>
    </div>
  );
};

export default XPBar;

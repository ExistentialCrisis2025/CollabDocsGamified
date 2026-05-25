import { useEffect, useState } from "react";

import api from "../api/axios";

import { Trophy, Medal, Crown, Flame } from "lucide-react";

type LeaderboardUser = {
  id: number;
  username: string;
  total_xp: number;
};

type LeaderboardResponse = {
  leaderboard: LeaderboardUser[];
  currentUserRank: number | null;
};

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardResponse | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const response = await api.get("/leaderboard/weekly", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLeaderboardData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  function getRankStyles(rank: number) {
    if (rank === 1) {
      return `
            border-yellow-400/40
            bg-yellow-500/10
            shadow-[0_0_30px_rgba(250,204,21,0.15)]
         `;
    }

    if (rank === 2) {
      return `
            border-zinc-400/40
            bg-zinc-400/10
         `;
    }

    if (rank === 3) {
      return `
            border-orange-500/40
            bg-orange-500/10
         `;
    }

    return `
         border-zinc-700
         bg-zinc-900/80
      `;
  }

  function getRankIcon(rank: number) {
    if (rank === 1) {
      return <Crown className="h-7 w-7 text-yellow-400" />;
    }

    if (rank === 2) {
      return <Medal className="h-7 w-7 text-zinc-300" />;
    }

    if (rank === 3) {
      return <Medal className="h-7 w-7 text-orange-400" />;
    }

    return <Trophy className="h-6 w-6 text-zinc-500" />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading leaderboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-10">
      <div className="mb-10">
        <h1 className="bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-5xl font-black text-transparent">
          Weekly Leaderboard
        </h1>

        <p className="mt-3 text-zinc-400">
          Compete with other users and climb the ranks.
        </p>
      </div>

      <div
        className="
               mb-8 rounded-2xl
               border border-blue-500/30
               bg-blue-500/10
               p-6 shadow-xl
            "
      >
        <div className="flex items-center gap-4">
          <div
            className="
                     rounded-xl bg-blue-500/20
                     p-3
                  "
          >
            <Flame className="h-8 w-8 text-blue-400" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">Your Current Rank</h2>

            <p className="text-sm text-zinc-400">
              Keep earning XP to climb higher
            </p>
          </div>
        </div>

        <div className="mt-6 text-5xl font-black text-blue-400">
          #{leaderboardData?.currentUserRank || "Unranked"}
        </div>
      </div>

      <div className="space-y-4">
        {leaderboardData?.leaderboard?.length ? (
          leaderboardData.leaderboard.map((user, index) => {
            const rank = index + 1;

            return (
              <div
                key={user.id}
                className={`
                              rounded-2xl border p-5
                              transition-all duration-200

                              hover:scale-[1.01]

                              ${getRankStyles(rank)}
                           `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div
                      className="
                                       flex h-14 w-14
                                       items-center justify-center
                                       rounded-2xl bg-zinc-800
                                    "
                    >
                      {getRankIcon(rank)}
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-white">
                          {user.username}
                        </h2>

                        <span
                          className="
                                             rounded-full
                                             bg-zinc-800
                                             px-3 py-1
                                             text-xs font-semibold
                                             text-zinc-400
                                          "
                        >
                          Rank #{rank}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-zinc-400">
                        Productivity Competitor
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-black text-yellow-400">
                      {user.total_xp}
                    </div>

                    <div className="mt-1 text-sm text-zinc-400">Weekly XP</div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div
            className="
                     rounded-2xl border
                     border-dashed border-zinc-700
                     p-10 text-center
                  "
          >
            <Trophy className="mx-auto mb-4 h-12 w-12 text-zinc-600" />

            <h2 className="text-2xl font-bold text-white">
              No leaderboard data yet
            </h2>

            <p className="mt-2 text-zinc-400">
              Complete tasks and earn XP to appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;

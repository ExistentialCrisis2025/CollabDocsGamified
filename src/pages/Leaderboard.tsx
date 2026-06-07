import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import { ArrowLeft, Crown, Flame, Medal, Trophy } from "lucide-react";
import { getAuthToken } from "../utils/authToken";

type LeaderboardUser = {
  id: number;
  username: string;
  total_xp: number;
};

type LeaderboardResponse = {
  leaderboard: LeaderboardUser[];
  currentUserRank: number | null;
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-7 w-7 text-amber-500" />;
  if (rank === 2) return <Medal className="h-7 w-7 text-slate-400" />;
  if (rank === 3) return <Medal className="h-7 w-7 text-orange-500" />;

  return <Trophy className="h-6 w-6 text-indigo-500" />;
};

const getRankStyles = (rank: number) => {
  if (rank === 1) {
    return "border-amber-200 bg-amber-50 shadow-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:shadow-amber-950/20";
  }

  if (rank === 2) {
    return "border-slate-200 bg-slate-50 dark:border-slate-600/40 dark:bg-slate-800/80";
  }

  if (rank === 3) {
    return "border-orange-200 bg-orange-50 dark:border-orange-500/30 dark:bg-orange-500/10";
  }

  return "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800";
};

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        const token = getAuthToken();
        const response = await api.get("/leaderboard/weekly", {
          headers: { Authorization: `Bearer ${token}` },
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

  const topUser = leaderboardData?.leaderboard?.[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <TopBar />

      <motion.main
        className="mx-auto max-w-5xl p-6 pt-12"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Link
          to="/dashboard"
          className="mb-8 flex w-max items-center gap-2 font-bold text-indigo-500 transition hover:text-indigo-600 dark:text-indigo-300"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Link>

        <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <div className="grid gap-6 p-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black uppercase text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <Trophy className="h-4 w-4" />
                Weekly XP race
              </div>
              <h1 className="text-4xl font-black leading-tight text-slate-950 dark:text-white sm:text-5xl">
                Weekly Leaderboard
              </h1>
              <p className="mt-4 max-w-2xl text-slate-500 dark:text-slate-400">
                Compete with other users, keep your streak warm, and climb the
                weekly XP ranks.
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-500/20 dark:bg-indigo-500/10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 dark:text-white">
                    Your Current Rank
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Keep earning XP to climb higher
                  </p>
                </div>
              </div>
              <div className="mt-5 text-5xl font-black text-indigo-600 dark:text-indigo-300">
                #{leaderboardData?.currentUserRank || "Unranked"}
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center font-bold text-slate-500 shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Loading leaderboard...
          </div>
        ) : (
          <>
            {topUser && (
              <section className="mb-8 rounded-3xl border border-amber-200 bg-white p-6 shadow-xl dark:border-amber-500/30 dark:bg-slate-800">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
                      <Crown className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase text-amber-600 dark:text-amber-300">
                        Current leader
                      </p>
                      <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                        {topUser.username}
                      </h2>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-4xl font-black text-amber-500">
                      {topUser.total_xp}
                    </div>
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      Weekly XP
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-4">
              {leaderboardData?.leaderboard?.length ? (
                leaderboardData.leaderboard.map((user, index) => {
                  const rank = index + 1;

                  return (
                    <motion.div
                      key={user.id}
                      className={`rounded-2xl border p-5 shadow-lg transition hover:-translate-y-0.5 ${getRankStyles(rank)}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-900">
                            {getRankIcon(rank)}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                                {user.username}
                              </h2>
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                                Rank #{rank}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              Productivity competitor
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-300">
                            {user.total_xp}
                          </div>
                          <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
                            Weekly XP
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <Trophy className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    No leaderboard data yet
                  </h2>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Complete tasks and earn XP to appear here.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </motion.main>
    </div>
  );
};

export default Leaderboard;

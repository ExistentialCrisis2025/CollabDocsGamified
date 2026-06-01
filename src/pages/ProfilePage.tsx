import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import TopBar from "../components/TopBar";
import { ArrowLeft, Trophy, Camera, CheckCircle2, Gift } from "lucide-react";
import type { Quest } from "../components/types/quest";
import { toast } from "react-hot-toast";

const ProfilePage = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [claiming, setClaiming] = useState<number | null>(null);

  useEffect(() => {
    fetchDashboard();
    fetchQuests();
    fetchBadges();
  }, []);

  async function fetchBadges() {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/badges/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBadges(response.data || []);
    } catch (error) {
      console.error("Failed to fetch badges", error);
    }
  }

  async function fetchDashboard() {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/users/me/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchQuests() {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/quests/today", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuests(response.data.quests || []);
    } catch (error) {
      console.error("Failed to fetch quests", error);
    }
  }

  const claimQuest = async (questId: number) => {
    try {
      setClaiming(questId);
      const token = localStorage.getItem("token");
      const response = await api.post(
        `/quests/${questId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Quest Completed! +${response.data.bonus_xp} XP`, {
        icon: '🏆',
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });

      // Refresh data
      fetchDashboard();
      fetchQuests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to claim quest");
    } finally {
      setClaiming(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <TopBar />
      
      <motion.div 
        className="mx-auto max-w-4xl p-6 pt-12"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-indigo-500 font-medium hover:underline w-max">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-12 flex flex-col items-center sm:flex-row gap-8 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="relative group cursor-pointer">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
               <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=6366f1" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
              {dashboardData?.user?.username || "Player One"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-4">Level {dashboardData?.user?.level || 1} • CollabDocs Voyager</p>
            
            {/* XP PROGRESS */}
            <div className="w-full">
                <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
                    <span>XP Progress</span>
                    <span className="text-indigo-500">{dashboardData?.user?.total_xp || 0} / {dashboardData?.user?.next_level_xp || "MAX"} XP</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400 transition-all duration-700 ease-out shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                      style={{
                      width: `${dashboardData?.user?.next_level_xp ? (dashboardData.user.total_xp / dashboardData.user.next_level_xp) * 100 : 100}%`,
                      }}
                  ></div>
                </div>
            </div>
          </div>
        </motion.div>

        {/* EARNED BADGES */}
        <motion.div variants={itemVariants} className="mb-8 rounded-3xl border border-indigo-200/50 dark:border-indigo-500/30 bg-white dark:bg-slate-800 p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-3 dark:bg-orange-500/20">
              <Trophy className="h-7 w-7 text-orange-500 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Earned Badges</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Achievements you've unlocked</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.length > 0 ? (
              badges.map((badge) => {
                const rarityColors: Record<string, string> = {
                  common: "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 text-slate-500",
                  rare: "border-blue-300 bg-blue-50 dark:border-blue-600/50 dark:bg-blue-900/30 text-blue-500",
                  epic: "border-purple-300 bg-purple-50 dark:border-purple-500/40 dark:bg-purple-900/40 text-purple-500",
                  legendary: "border-orange-300 bg-orange-50 dark:border-orange-500/50 dark:bg-orange-900/50 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]",
                };
                const rarityGradients: Record<string, string> = {
                  common: "from-slate-400 to-slate-500",
                  rare: "from-blue-400 to-blue-500",
                  epic: "from-purple-400 to-purple-500",
                  legendary: "from-amber-400 to-orange-500",
                };

                const cardStyle = rarityColors[badge.rarity] || rarityColors.common;
                const iconGradient = rarityGradients[badge.rarity] || rarityGradients.common;

                return (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center p-5 rounded-2xl border text-center transition-transform hover:scale-105 ${cardStyle}`}
                  >
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${iconGradient} flex items-center justify-center mb-3 shadow-lg`}>
                      <Trophy className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white capitalize text-sm mb-1">{badge.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2rem]">
                      {badge.description}
                    </p>
                    <div className="mt-3 text-[10px] font-bold uppercase tracking-wider opacity-70">
                      {badge.rarity}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center text-slate-500 dark:text-slate-400 py-6">
                No badges earned yet. Keep completing tasks to unlock them!
              </div>
            )}
          </div>
        </motion.div>

        {/* DAILY QUESTS */}
        <motion.div variants={itemVariants} className="mb-8 rounded-3xl border border-indigo-200/50 dark:border-indigo-500/30 bg-white dark:bg-slate-800 p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-3 dark:bg-indigo-500/20">
              <Trophy className="h-7 w-7 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Daily Quests</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Bonus challenges for extra XP</p>
            </div>
          </div>

          <div className="space-y-4">
            {quests.length > 0 ? (
              quests.map((quest) => {
                const isCompleted = quest.status === 'completed';
                const canClaim = quest.status === 'active' && quest.current_progress >= quest.target_value;
                const progressPercent = Math.min((quest.current_progress / quest.target_value) * 100, 100);

                return (
                  <div
                    key={quest.id}
                    className={`rounded-xl border p-5 transition-all duration-200 ${
                      isCompleted 
                        ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/5" 
                        : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/70"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg">{quest.title}</h3>
                          {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        </div>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{quest.description}</p>
                        
                        {/* Progress Bar */}
                        {!isCompleted && (
                           <div className="max-w-xs mt-3 flex items-center gap-3">
                             <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                               <div 
                                 className={`h-full rounded-full transition-all duration-500 ${canClaim ? 'bg-amber-400' : 'bg-indigo-500'}`}
                                 style={{ width: `${progressPercent}%` }}
                               />
                             </div>
                             <span className="text-xs font-bold text-slate-500 dark:text-slate-400 min-w-[3rem]">
                               {quest.current_progress} / {quest.target_value}
                             </span>
                           </div>
                        )}
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 border-slate-200 dark:border-slate-700 pt-3 sm:pt-0">
                        <div className="rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                          ⭐ {quest.bonus_xp} XP
                        </div>
                        
                        {isCompleted ? (
                          <div className="text-sm font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                            Claimed
                          </div>
                        ) : canClaim ? (
                          <button
                            onClick={() => claimQuest(quest.id)}
                            disabled={claiming === quest.id}
                            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                          >
                            <Gift className="w-4 h-4" />
                            {claiming === quest.id ? "Claiming..." : "Claim Reward"}
                          </button>
                        ) : (
                          <div className="text-sm font-bold text-slate-400 dark:text-slate-500">
                            In Progress
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400 py-6">No quests available today</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassContainer from "../Global/GlassContainer";
import { useAuthStore } from "@/zustand/AuthStore";
import { useRewardsStore } from "@/zustand/RewardsStore";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getRankColor = (rank: number) => {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-gray-300";
  if (rank === 3) return "text-orange-400";
  return "text-blue-400";
};

const MonthlyRewardsNotification: React.FC = () => {
  const auth = useAuthStore();
  const {
    rewards,
    showModal,
    claiming,
    fetchRewards,
    closeModal,
    claimReward,
  } = useRewardsStore();

  useEffect(() => {
    if (auth.jwt && auth.account?.AccountID) {
      fetchRewards(auth.account.AccountID, auth.jwt);
    }
  }, [auth.jwt, auth.account?.AccountID, fetchRewards]);

  const handleClaim = async () => {
    if (rewards.length === 0 || !auth.jwt) return;
    await claimReward(rewards[0].Id, rewards[0].Rank, auth.jwt);
  };

  let currentReward = rewards[0];
  return (
    <>
      <AnimatePresence>
        {showModal && currentReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-lg z-[100] flex items-center justify-center p-6"
            onClick={() => !claiming && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{
                scale: 1,
                y: 0,
                opacity: 1,
                transition: {
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                },
              }}
              exit={{
                scale: 0.9,
                y: 50,
                opacity: 0,
                transition: { duration: 0.2 },
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <GlassContainer className="border border-white/10 p-6 overflow-hidden relative rounded-md shadow-xl">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <h2 className="text-xl font-bold text-white mb-1">
                    Monthly Leaderboard Reward!
                  </h2>
                  <p className="text-white/40 text-sm">
                    {MONTHS[currentReward.Month - 1]} {currentReward.Year}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white/5 rounded p-3 mb-4"
                >
                  <p className="text-white/70 text-sm">
                    You placed{" "}
                    <span
                      className={`font-semibold ${getRankColor(currentReward.Rank)}`}
                    >
                      #{currentReward.Rank}
                    </span>{" "}
                    on the leaderboard last month. Claim your exclusive reward
                    for being in the top 5.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3 mb-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Rank</span>
                    <span
                      className={`font-semibold ${getRankColor(currentReward.Rank)}`}
                    >
                      #{currentReward.Rank}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Hype</span>
                    <span className="font-semibold text-white">
                      {currentReward.Hype.toLocaleString()}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex gap-2"
                >
                  <motion.button
                    onClick={closeModal}
                    disabled={claiming}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-sm font-medium transition-colors"
                  >
                    Later
                  </motion.button>
                  <motion.button
                    onClick={handleClaim}
                    disabled={claiming}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-sm font-medium transition-colors"
                  >
                    {claiming ? "Claiming..." : "Claim"}
                  </motion.button>
                </motion.div>
              </GlassContainer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MonthlyRewardsNotification;

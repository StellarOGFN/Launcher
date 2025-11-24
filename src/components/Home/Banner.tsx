"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBannerStore } from "../../zustand/BannerStore";
import GlassContainer from "../Global/GlassContainer";

// for glow i used a script with library node-vibrant/node
const LaunchPosts = [
  {
    title: "Top Secret",
    description:
      "Relive Chapter 2 Season 2 once again with Stellar. Take out enemies, defeat bosses, and dominate the island.",
    banner: "https://cdn.stellarfn.dev/NewsTopSecretLauncher.jpg",
    glow: ["rgba(106,99,108,0.5)", "rgba(176,169,178,0.3)"],
  },
  {
    title: "Challenges & XP",
    description:
      "Complete daily quests and weekly challenges to earn XP and rewards.",
    banner:
      "https://cdn2.unrealengine.com/Fortnite%2Fblog%2Fnew-storm-the-agency-challenges-and-more%2F12BR_StormTheAgency_Screenshot_NewsHeader-1920x1080-827d2a34a897754277e78a3af9efbdad64dddcaa.jpg",
    glow: ["rgba(89,58,56,0.5)", "rgba(159,128,126,0.3)"],
  },
];

const Banner: React.FC = () => {
  const { PostIndex, incrementPostIndex } = useBannerStore();
  const current = LaunchPosts[PostIndex];

  return (
    <GlassContainer
      className="relative w-full border border-white/20 rounded-lg overflow-hidden h-72"
      style={{
        boxShadow: `
          0 0 20px 0px ${current.glow[0]},
          0 0 40px 0px ${current.glow[1]}
        `,
        transition: "box-shadow 0.8s ease",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={PostIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={current.banner}
            className="w-full h-full object-cover brightness-[0.65]"
            draggable={false}
            alt=""
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/25 to-transparent">
        <div className="space-y-4">
          <motion.h3
            key={current.title}
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
            transition={{ duration: 0.45 }}
            className="text-2xl font-bold text-white"
          >
            {current.title}
          </motion.h3>

          <motion.p
            key={current.description}
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
            transition={{ duration: 0.45 }}
            className="text-white/80 text-sm max-w-lg"
          >
            {current.description}
          </motion.p>

          <div className="flex items-center justify-between pt-2">
            <button
              className="px-6 py-2 bg-gray-500/10 bg-clip-padding backdrop-filter backdrop-blur-lg
         backdrop-saturate-100 backdrop-contrast-100 bg-glass-noise
        shadow-xl border border-white/20 text-white rounded-md text-sm transition-all"
            >
              Play Now
            </button>
            <div className="flex items-center gap-2">
              {LaunchPosts.map((_, index) => (
                <button key={index} className="relative">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      index === PostIndex ? "w-8 bg-white" : "w-4 bg-white/30"
                    }`}
                  />
                  {index === PostIndex && (
                    <motion.div
                      className="absolute inset-0 h-1 bg-white/40 rounded-full origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 4, ease: "linear" }}
                      onAnimationComplete={incrementPostIndex}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GlassContainer>
  );
};

export default Banner;

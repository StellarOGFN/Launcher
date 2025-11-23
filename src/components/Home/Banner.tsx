"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Banner = () => {
  const [postIndex, setPostIndex] = useState(0);

  const launchPosts = [
    {
      title: "Stellar: Chapter 2 Season 2",
      description: "Take out enemies, defeat bosses, and dominate the island.",
      banner:
        "https://cdn.discordapp.com/attachments/1414921548292427816/1442252514933346415/image.png?ex=6924c1d3&is=69237053&hm=c41dd0579ef38c037342e142f83782bc2cebd5e4210fb6987e4712b6a88b2c52&",
    },
    {
      title: "Challenges & XP",
      description:
        "Complete daily quests and weekly challenges to earn XP and rewards.",
      banner:
        "https://cdn2.unrealengine.com/Fortnite%2Fblog%2Fnew-storm-the-agency-challenges-and-more%2F12BR_StormTheAgency_Screenshot_NewsHeader-1920x1080-827d2a34a897754277e78a3af9efbdad64dddcaa.jpg",
    },
  ];

  const incrementPostIndex = () => {
    setPostIndex((prev) => (prev + 1) % launchPosts.length);
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden h-72 border border-white/10 shadow-2xl shadow-purple-500/20">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-indigo-900/40 animate-pulse" style={{ animationDuration: '4s' }} />
      
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />

      <AnimatePresence mode="wait">
        <motion.img
          key={postIndex}
          initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
          transition={{ 
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1]
          }}
          src={launchPosts[postIndex].banner}
          alt="banner"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
          draggable={false}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-blue-950/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-end p-6">
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            <motion.h3
              key={`title-${postIndex}`}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ 
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="text-2xl font-bold text-white drop-shadow-lg"
            >
              {launchPosts[postIndex].title}
            </motion.h3>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${postIndex}`}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ 
                duration: 0.5,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="text-white/90 text-sm max-w-lg drop-shadow-md"
            >
              {launchPosts[postIndex].description}
            </motion.p>
          </AnimatePresence>

          <div className="flex items-center justify-between pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md font-semibold text-sm shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
            >
              Play Now
            </motion.button>

            {launchPosts.length > 1 && (
              <div className="flex items-center gap-2.5">
                {launchPosts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setPostIndex(index)}
                    className="relative group"
                  >
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        index === postIndex
                          ? "w-10 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                          : "w-10 bg-white/20 group-hover:bg-white/40"
                      }`}
                    />
                    {index === postIndex && (
                      <motion.div
                        className="absolute top-0 left-0 h-1.5 rounded-full bg-gradient-to-r from-white via-blue-200 to-white shadow-[0_0_8px_rgba(255,255,255,0.8)] origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 4, ease: "linear" }}
                        onAnimationComplete={incrementPostIndex}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
        <motion.div
          key={postIndex}
          className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 shadow-[0_0_16px_rgba(168,85,247,0.8)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 4, ease: "linear" }}
          style={{ transformOrigin: "left" }}
        />
      </div>
    </div>
  );
};

export default Banner;
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GlassContainer from "../components/Global/GlassContainer";

const openDiscordURI = async () => {
  window.open(
    "https://prod-api-v1.stellarfn.dev/stellar/external/discord",
    "_blank"
  );
};

const Login: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showWelcome ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="absolute flex flex-col items-center gap-4 pointer-events-none"
        style={{ visibility: showWelcome ? "visible" : "hidden" }}
      >
        <motion.img
          src="/StellarStar.png"
          alt="Stellar"
          className="h-28 w-28 object-contain"
          draggable={false}
          initial={{ y: -60, opacity: 0, scale: 0.85, rotate: -8 }}
          animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: "spring", stiffness: 140 }}
        />

        <motion.h1
          className="text-5xl font-bold text-white tracking-wide text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Welcome to Stellar
        </motion.h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showWelcome ? 0 : 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md mx-4"
        style={{ pointerEvents: showWelcome ? "none" : "auto" }}
      >
        <GlassContainer className="p-12 flex flex-col items-center">
          <motion.img
            src="/StellarStar.png"
            alt="Stellar"
            className="h-20 w-20 object-contain mb-4"
            draggable={false}
            initial={{ x: -160, y: -120, opacity: 0, rotate: -25 }}
            animate={{
              x: 0,
              y: 0,
              opacity: showWelcome ? 0 : 1,
              rotate: 0,
            }}
            transition={{ duration: 0.9, ease: [0.12, 0.65, 0.4, 1] }}
          />

          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">
              Login
            </h2>
            <p className="text-white/70 text-sm">
              Connect your Discord account
            </p>
          </div>

          <button
            onClick={async () => await openDiscordURI()}
            className="w-full py-4 px-6 rounded-xl bg-indigo-500/80 hover:bg-indigo-500 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 border border-indigo-300/20"
          >
            <span>Continue</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </GlassContainer>
      </motion.div>
    </div>
  );
};

export default Login;

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GlassContainer from "../components/Global/GlassContainer";
import { open } from "@tauri-apps/plugin-shell";
import { useRoutingStore } from "@/zustand/RoutingStore";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/zustand/AuthStore";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

const Login: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const Routing = useRoutingStore();
  const AuthStore = useAuthStore();
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      await Routing.initRouting(["auth", "public", "account", "oauth"]);
      setIsLoggedIn(await AuthStore.init());

      const update = await check();
      if (update) {
        // https://v2.tauri.app/plugin/updater/#checking-for-updates
        console.log(
          `found update ${update.version} from ${update.date} with notes ${update.body}`
        );
        let downloaded = 0;
        let contentLength: number | undefined = 0;
        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case "Started":
              contentLength = event.data.contentLength;
              console.log(
                `started downloading ${event.data.contentLength} bytes`
              );
              break;
            case "Progress":
              downloaded += event.data.chunkLength;
              console.log(`downloaded ${downloaded} from ${contentLength}`);
              break;
            case "Finished":
              console.log("download finished");
              break;
          }
        });

        console.log("update installed");
        await relaunch();
      }
    })();

    const status = async (): Promise<Boolean> => {
      if (isLoggedIn) {
        return await AuthStore.login(AuthStore.jwt ?? "");
      }

      return false;
    };

    const timer = setTimeout(async () => {
      if (await status()) {
        nav("/home");
      }
      setShowWelcome(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  const handleClick = () => {
    const authRoute = Routing.Routes.get("auth");
    if (authRoute) {
      open(authRoute.url);
    } else {
      console.error("route not found");
    }
  };

  useEffect(() => {
    onOpenUrl(async (urls: string[]) => {
      urls.forEach(async (url) => {
        if (url.startsWith("stellar://")) {
          let jwt = url.split("stellar://")[1];
          if (jwt.endsWith("/")) jwt = jwt.slice(0, -1);

          if (await AuthStore.login(jwt)) {
            nav("/home");
          }
        }
      });
    });

    return () => {};
  }, [nav]);

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
          initial={{ opacity: 0, filter: "blur(15px)", y: 10 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
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
        <GlassContainer className="p-6 flex flex-col items-center bg-glass-noise rounded-lg">
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
            onClick={handleClick}
            className="group/button bg-glass-noise relative min-w-[375px] inline-flex items-center overflow-hidden rounded-md bg-blue-800/30 backdrop-blur-lg px-12 py-3 justify-center gap-2 text-base font-semibold text-white transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl hover:shadow-gray-600/10 border border-white/20"
          >
            <span>Continue</span>
            <ArrowRight className="h-5 w-5" />
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
              <div className="relative h-full w-10 bg-white/20"></div>
            </div>
          </button>
        </GlassContainer>
      </motion.div>
    </div>
  );
};

export default Login;

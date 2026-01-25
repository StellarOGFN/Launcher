import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Banner from "../components/Home/Banner";
import Donate from "../components/Home/Donate";
import GithubChangelogs from "../components/Home/GithubChangelogs";
import MonthlyRewardsNotification from "../components/Home/MonthlyRewardsNotification";

import { useAuthStore } from "@/zustand/AuthStore";
import { useRoutingStore } from "@/zustand/RoutingStore";
import { Stellar } from "@/stellar";

const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 18) {
    return "Good afternoon";
  } else {
    return "Evening";
  }
};

const Home: React.FC = () => {
  const greeting = getGreeting();
  const AuthStore = useAuthStore();
  const Routing = useRoutingStore();

  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [loadingOnline, setLoadingOnline] = useState(true);

  useEffect(() => {
    const fetchOnline = async () => {
      setLoadingOnline(true);
      try {
        const res = await Stellar.Requests.get<{ count: number }>(
          `${Routing.Routes.get("public")?.url}/online`,
        );

        if (res.ok && res.data) setOnlineCount(res.data.count);
      } catch (err) {
        console.error("failed to fetch online players:", err);
      } finally {
        setLoadingOnline(false);
      }
    };

    fetchOnline();
    const interval = setInterval(fetchOnline, 10000);
    return () => clearInterval(interval);
  }, [Routing]);

  return (
    <>
      <MonthlyRewardsNotification />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "tween",
          duration: 0.3,
        }}
        className="w-[calc(100vw-64px)] ml-16 h-screen flex flex-col px-7 pt-5 justify-start items-start"
      >
        <div className="w-full flex flex-col gap-5 py-5 z-10 h-full">
          <div>
            <h2 className="text-xl font-normal flex flex-row gap-1.5 text-white">
              {greeting},{" "}
              <p className="font-bold text-[#274799]">
                {AuthStore.account?.DisplayName}!
              </p>
            </h2>
            <p className="text-white font-normal text-sm">
              {loadingOnline
                ? "1 Player Online"
                : `${onlineCount} Player${onlineCount === 1 ? "" : "s"} Online`}
            </p>
          </div>
          <Banner />
          <div className="w-full flex gap-2 justify-end">
            <GithubChangelogs />
            <Donate />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Home;

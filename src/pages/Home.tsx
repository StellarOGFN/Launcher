import React from "react";
import { motion } from "framer-motion";
import Banner from "../components/Home/Banner";
import Stats from "../components/Home/Stats";

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

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "tween",
        duration: 0.3,
      }}
      className="w-[calc(100vw-64px)] ml-16 h-screen flex flex-col px-7 pt-7 justify-start items-start"
    >
      <div className="w-full flex flex-col gap-5 py-5 z-10 h-full">
        <div>
          <h2 className="text-xl font-normal flex flex-row gap-1.5 text-white">
            {greeting}, <p className="font-bold text-[#274799]">andr1ww!</p>
          </h2>
          <p className="text-white font-normal text-sm">0 Players Online</p>
        </div>
        <Banner />
        <div className="w-full flex justify-end">
          <Stats />
        </div>
      </div>
    </motion.div>
  );
};

export default Home;

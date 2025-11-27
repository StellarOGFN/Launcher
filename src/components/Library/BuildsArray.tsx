import React from "react";
import { motion } from "framer-motion";
import BuildStore from "@/zustand/BuildStore";
import BuildCard from "./BuildCard";

const BuildsArray: React.FC = () => {
  const { builds, remove } = BuildStore();
  const buildsArray = Array.from(builds.entries());

  const handlePlay = (path: string) => console.log("Playing:", path);
  const handleDelete = (path: string) => remove(path);

  if (buildsArray.length === 0) {
    return (
      <motion.div
        initial={{ filter: "blur(10px)", opacity: 0 }}
        animate={{ filter: "blur(0px)", opacity: 1 }}
        exit={{ filter: "blur(10px)", opacity: 0 }}
        transition={{ type: "tween", duration: 0.25 }}
        className="w-full my-6 flex items-center justify-center py-16"
      >
        <p className="text-gray-500 text-sm">No builds imported yet</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ filter: "blur(10px)", opacity: 0 }}
      animate={{ filter: "blur(0px)", opacity: 1 }}
      exit={{ filter: "blur(10px)", opacity: 0 }}
      transition={{ type: "tween", duration: 0.25 }}
      className="w-full my-6"
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
        {buildsArray.map(([path, build]) => (
          <BuildCard
            key={path}
            path={path}
            build={build}
            onDelete={handleDelete}
            onPlay={handlePlay}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default BuildsArray;

import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoPlay } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import BuildStore, { IBuild } from "@/zustand/BuildStore";
import GlassContainer from "../Global/GlassContainer";

const BuildCard: React.FC<{
  path: string;
  build: IBuild;
  onDelete: (path: string) => void;
  onPlay: (path: string) => void;
}> = ({ path, build, onDelete, onPlay }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const hasSplash = build.splash && build.splash !== "no splash";

  return (
    <GlassContainer className="relative w-full h-[260px] 2xl:h-[320px] rounded-md border border-white/25 overflow-hidden shadow-lg group">
      {!isLoaded && (
        <div className="absolute w-full h-full bg-gradient-to-br from-slate-700/50 to-slate-900/50 flex items-center justify-center">
          <span className="text-white/30 text-sm">Loading Splash...</span>
        </div>
      )}
      {hasSplash ? (
        <img
          src={build.splash}
          alt={`Fortnite ${build.version}`}
          className="absolute w-full h-full object-cover transition-all ease-in-out duration-500 group-hover:scale-110"
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div className="absolute w-full h-full bg-gradient-to-br from-slate-700/50 to-slate-900/50 flex items-center justify-center">
          <span className="text-white/30 text-sm">No Splash</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 bg-gradient-to-t px-1 py-1 from-black/68 to-black/2 w-full h-full opacity-100 transition-all ease duration-300 flex flex-col justify-end items-start">
        <span className="text-white/80 text-sm leading-3 translate-y-0 transition-all duration-350 delay-45">
          Fortnite {build.version}
        </span>
        <span className="text-white/35 font-light text-xs translate-y-0 transition-all duration-350 delay-25">
          {build.release}
        </span>
        <div className="absolute right-2 bottom-2 flex flex-col gap-1 items-center">
          <button
            onClick={() => onPlay(path)}
            className="flex items-center justify-center text-white/55 p-1 rounded-sm border border-white/25 hover:text-white/80 translate-x-8 group-hover:translate-x-0 hover:border-white/50 transition duration-200 bg-gray-500/5 backdrop-blur-sm shadow-sm"
          >
            <IoPlay className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={() => onDelete(path)}
            className="flex items-center justify-center text-white/55 p-1 rounded-sm border border-white/25 hover:text-white/80 translate-x-8 group-hover:translate-x-0 hover:border-white/50 transition duration-200 bg-gray-500/5 backdrop-blur-sm shadow-sm"
          >
            <MdDeleteForever className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </GlassContainer>
  );
};

export default BuildCard;

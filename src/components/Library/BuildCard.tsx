import React, { useEffect, useRef, useState } from "react";
import { IoPlay } from "react-icons/io5";
import { MdDeleteForever, MdClose } from "react-icons/md";
import { IBuild } from "@/zustand/BuildStore";
import GlassContainer from "../Global/GlassContainer";
import { BiPause } from "react-icons/bi";

const BuildCard: React.FC<{
  path: string;
  build: IBuild;
  onDelete: (path: string) => void;
  onPlay: (path: string) => void;
  onLaunch?: (path: string) => void;
  onClose: (path: string) => void;
}> = ({ path, build, onDelete, onPlay, onClose, onLaunch }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const prevLoading = useRef(build.loading);

  useEffect(() => {
    if (!prevLoading.current && build.loading) {
      if (onLaunch) onLaunch(path);
    }
    prevLoading.current = build.loading;
  }, [build.loading, onLaunch, path]);

  const hasSplash = build.splash && build.splash !== "no splash";

  return (
    <GlassContainer
      onClick={() => {
        // some ppl could get confused cuz the play button is there after hover so
        if (!build.loading) return onPlay(path);
      }}
      className="relative w-full h-[260px] 2xl:h-[320px] rounded-md border border-white/25 bg-gradient-to-t from-black/40 to-transparent overflow-hidden shadow-lg group"
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700/50 to-slate-900/50 flex items-center justify-center z-20">
          <span className="text-white/30 text-sm">Loading Splash...</span>
        </div>
      )}

      {hasSplash ? (
        <img
          src={build.splash}
          alt={`Fortnite ${build.version}`}
          className="absolute inset-0 w-full h-full object-cover transition-all ease-in-out duration-500 group-hover:scale-105"
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700/50 to-slate-900/50 flex items-center justify-center">
          <span className="text-white/30 text-sm">No Splash</span>
        </div>
      )}

      {build.open && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/25 backdrop-blur-[10px] transition-opacity duration-300">
          <BiPause className="w-16 h-16 text-white" />
        </div>
      )}

      <div className="absolute bottom-0 left-0 bg-gradient-to-t px-2 py-2 from-black/68 to-black/2 w-full h-full flex flex-col justify-end items-start z-40">
        <span className="text-white/80 text-sm leading-3">
          Fortnite {build.version}
        </span>
        <span className="text-white/35 font-light text-xs">
          {build.release}
        </span>

        <div className="absolute right-2 bottom-2 flex flex-col gap-1 items-center z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (build.open) return onClose(path);
              if (!build.loading) return onPlay(path);
            }}
            className="flex items-center justify-center text-white/55 p-2 rounded-md border border-white/25 hover:text-white/80 translate-x-10 group-hover:translate-x-0 hover:border-white/50 transition duration-200 bg-gray-500/5 backdrop-blur-sm shadow-sm"
          >
            {build.open ? (
              <MdClose className="w-3 h-3" />
            ) : build.loading ? (
              <div className="w-3 h-3 rounded-full bg-transparent border-px border-white/25 border-t-transparent animate-spin" />
            ) : (
              <IoPlay className="w-3 h-3" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(path);
            }}
            className="flex items-center justify-center text-white/55 p-2 rounded-md border border-white/25 hover:text-white/80 translate-x-10 group-hover:translate-x-0 hover:border-white/50 transition duration-200 bg-gray-500/5 backdrop-blur-sm shadow-sm"
          >
            <MdDeleteForever className="w-3 h-3" />
          </button>
        </div>
      </div>
    </GlassContainer>
  );
};

export default BuildCard;

import React from "react";
import { Window } from "@tauri-apps/api/window";
import { HiX, HiMinus } from "react-icons/hi";

const Frame: React.FC = () => {
  return (
    <div
      data-tauri-drag-region
      className="fixed w-screen h-7 top-0 left-0 flex justify-end items-center z-50"
    >
      <div className="flex items-center ml-3 mt-1"></div>
      <div className="flex text-white h-full">
        <button
          onClick={() => Window.getCurrent().minimize()}
          className="cursor-pointer  w-10 h-7 flex justify-center items-center hover:bg-white/20 transition-all rounded-sm hover:backdrop-blur-2xl duration-220"
        >
          <HiMinus />
        </button>

        <button
          onClick={() => Window.getCurrent().close()}
          className="cursor-pointer w-10 h-7 flex justify-center items-center hover:bg-red-500/50 transition-all rounded-sm hover:backdrop-blur-2xl duration-220"
        >
          <HiX />
        </button>
      </div>
    </div>
  );
};

export default Frame;

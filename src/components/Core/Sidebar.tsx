import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { LibraryBig } from "lucide-react";
import { TbSettings, TbLogout } from "react-icons/tb";
import { motion, easeOut, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import GlassContainer from "../Global/GlassContainer";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  const baseButton =
    "flex justify-center items-center w-10 h-10 rounded-md transition-all duration-300 cursor-pointer group";
  const activeButton =
    "shadow-glass-shine border border-white/10 shadow-lg shadow-white/5";
  const hoverButton =
    "hover:bg-white/5 border border-transparent hover:border-white/10";
  const iconClass =
    "w-4 h-4 max-w-full max-h-full text-gray-400 transition-all duration-300 group-hover:text-white";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.6, ease: easeOut } }}
      className="
        fixed top-0 left-0 w-16 h-screen
        bg-gray-500/5 border-r border-r border-white/20 bg-glass-noise bg-clip-padding backdrop-filter backdrop-blur-lg
        backdrop-saturate-100 backdrop-contrast-100
        shadow-xl flex flex-col justify-between items-center px-3 py-4 z-50
      "
    >
      <div className="flex flex-col gap-3.5">
        <motion.img
          src="StellarStar.png"
          alt="Logo"
          draggable={false}
          className="scale-92"
          animate={{
            filter: [
              "drop-shadow(0 0 5px rgba(255,255,255,0.3))",
              "drop-shadow(0 0 15px rgba(255,255,255,0.8))",
              "drop-shadow(0 0 5px rgba(255,255,255,0.3))",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />

        <button
          onClick={() => navigate("/home")}
          className={`${baseButton} ${
            location.pathname === "/home" ? activeButton : hoverButton
          }`}
        >
          <GoHomeFill
            className={`${iconClass} ${
              location.pathname === "/home" ? "text-white/80" : ""
            }`}
          />
        </button>

        <button
          onClick={() => navigate("/library")}
          className={`${baseButton} ${
            location.pathname === "/library" ? activeButton : hoverButton
          }`}
        >
          <LibraryBig
            className={`${iconClass} ${
              location.pathname === "/library" ? "text-white/80" : ""
            }`}
          />
        </button>
      </div>

      <div className="relative z-[50]" ref={profileRef}>
        <button
          onClick={() => setShowProfileMenu((prev) => !prev)}
          className={`${baseButton} ${hoverButton} overflow-visible relative`}
        >
          <img
            src="https://cdn.discordapp.com/avatars/903815911830589462/a_0eb9ae578f957c358faa1c7f449dbecd.gif?size=512"
            alt="avatar"
            className="w-8 h-8 rounded-md object-cover"
            draggable={false}
          />
        </button>

        <AnimatePresence>
          {showProfileMenu && (
            <>
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-3 left-[3.25rem]  "
              >
                <div
                  className={`
      w-2 h-2
      border-t-[1.5px] border-l-[1.5px]
      border-white/20
      -rotate-45
      origin-center
      transition-all duration-200
      ${showProfileMenu ? "border-white/40" : ""}
    `}
                />
              </motion.div>

              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute left-14 bottom-0 z-10 bg-gray-500/5 bg-clip-padding backdrop-filter backdrop-blur-lg
         backdrop-saturate-100 backdrop-contrast-100
        shadow-xl"
              >
                <div className="liquid-glass w-44 bg-glass-noise rounded-md overflow-hidden border border-white/20">
                  <div className="glass-effect"></div>
                  <div className="glass-tint"></div>
                  <div className="glass-shine"></div>

                  <div className="glass-content">
                    <div className="p-2.5 px-3 border-b border-white/10">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="https://cdn.discordapp.com/avatars/903815911830589462/a_0eb9ae578f957c358faa1c7f449dbecd.gif?size=512"
                          alt="avatar"
                          className="w-8 h-8 rounded-lg object-cover"
                          draggable={false}
                        />
                        <div className="flex flex-col">
                          <h3 className="font-medium text-white text-sm">
                            andr1ww
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="p-1.5 flex flex-col gap-1.5">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate("/settings");
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 text-white/80 hover:bg-white/10 rounded-md transition-all duration-200 group"
                      >
                        <TbSettings className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
                        <span className="text-xs">Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate("/");
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 text-red-400 hover:bg-red-500/10 rounded-md transition-all duration-200 group"
                      >
                        <TbLogout className="w-3.5 h-3.5 text-red-400 group-hover:text-red-300 transition-colors" />
                        <span className="text-xs">Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Sidebar;

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Wrench, Gamepad, Palette } from "lucide-react";
import GlassContainer from "../Global/GlassContainer";
import { useAuthStore } from "@/zustand/AuthStore";

export const SettingsTopBar: React.FC<{
  onSelect: (key: string) => void;
  active?: string;
}> = ({ onSelect, active }) => {
  const AuthStore = useAuthStore();
  const sections = [
    { name: "Game Options", icon: <Gamepad size={15} /> },
    { name: "Customization", icon: <Palette size={15} /> },
    // { name: "Options", icon: <Settings size={15} /> },
  ];

  useEffect(() => {
    if (AuthStore.account?.Roles.includes("Developer")) {
      sections.push({ name: "Developer", icon: <Wrench size={15} /> });
    }
  }, []);

  // lets not do mt-2 later on
  return (
    <GlassContainer className="w-full py-2 px-4 rounded-lg flex justify-center mt-2">
      <div className="flex gap-2">
        {sections.map((sec) => {
          const isActive = active === sec.name;

          return (
            <motion.button
              key={sec.name}
              onClick={() => onSelect(sec.name)}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                transition-all duration-200 select-none
                ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <span className="opacity-70 group-hover:opacity-100 transition">
                {sec.icon}
              </span>

              {sec.name}

              {isActive && (
                <motion.div
                  layoutId="settings-active"
                  className="ml-1 w-1.5 h-1.5 rounded-full bg-white"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </GlassContainer>
  );
};

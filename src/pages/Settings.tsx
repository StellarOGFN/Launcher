import React, { useState } from "react";
import { motion } from "framer-motion";
import { SettingsTopBar } from "@/components/Settings/Sidebar";

import { GameOptionsPage } from "@/components/Settings/pages/GameOptionsPage";
import { OptionsPage } from "@/components/Settings/pages/OptionsPage";
import { DeveloperPage } from "@/components/Settings/pages/DeveloperPage";
import GlassContainer from "@/components/Global/GlassContainer";
import { ThemePage } from "@/components/Settings/pages/ThemePage";

const Settings: React.FC = () => {
  const [view, setView] = useState("Game");

  const renderView = () => {
    switch (view) {
      case "Game":
        return <GameOptionsPage />;
      case "Options":
        return <OptionsPage />;
      case "Developer":
        return <DeveloperPage />;
      case "Customization":
        return <ThemePage />;
      default:
        return <GameOptionsPage />;
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "tween", duration: 0.3 }}
      className="w-[calc(100vw-64px)] ml-16 h-screen flex flex-col items-center px-5 py-6"
    >
      <div className="w-full max-w-5xl mb-5">
        <SettingsTopBar onSelect={(v) => setView(v)} />
      </div>

      <motion.div
        key={view}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-5xl flex-1"
      >
        <GlassContainer className="p-6 rounded-lg h-full">
          {renderView()}
        </GlassContainer>
      </motion.div>
    </motion.div>
  );
};

export default Settings;

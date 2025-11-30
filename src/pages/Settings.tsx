import React, { useState } from "react";
import { motion } from "framer-motion";
import { SettingsTopBar } from "@/components/Settings/Sidebar";

import { AppearancePage } from "@/components/Settings/pages/AppearancePage";
import { AccountPage } from "@/components/Settings/pages/AccountPage";
import { OptionsPage } from "@/components/Settings/pages/OptionsPage";
import { DeveloperPage } from "@/components/Settings/pages/DeveloperPage";
import GlassContainer from "@/components/Global/GlassContainer";

const Settings: React.FC = () => {
  const [view, setView] = useState("Appearance");

  const renderView = () => {
    switch (view) {
      case "Appearance":
        return <AppearancePage />;
      case "Account":
        return <AccountPage />;
      case "Options":
        return <OptionsPage />;
      case "Developer":
        return <DeveloperPage />;
      default:
        return <AppearancePage />;
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "tween", duration: 0.3 }}
      className="w-[calc(100vw-64px)] ml-16 h-screen flex flex-col items-center px-5 py-8"
    >
      <div className="w-full max-w-5xl mb-6">
        <SettingsTopBar onSelect={(v) => setView(v)} />
      </div>

      <motion.div
        key={view}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-5xl flex-1"
      >
        <GlassContainer className="p-8 rounded-xl h-full">
          {renderView()}
        </GlassContainer>
      </motion.div>
    </motion.div>
  );
};

export default Settings;

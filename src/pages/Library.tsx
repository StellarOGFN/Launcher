import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BuildsGrid from "@/components/Library/BuildsArray";
import ImportBuildModal from "@/components/Library/ImportBuildModal";
import { FiPlus } from "react-icons/fi";

const Library: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "tween",
          duration: 0.3,
        }}
        className="w-[calc(100vw-64px)] ml-16 h-screen flex flex-col px-7 pt-5 justify-start items-start"
      >
        <AnimatePresence mode="wait">
          <BuildsGrid key="grid" />
        </AnimatePresence>
      </motion.div>

      <button
        onClick={() => setIsImportModalOpen(true)}
        className="
          fixed bottom-5 right-5 flex items-center gap-2 px-2 py-2 
          rounded-md bg-gray-500/5 bg-clip-padding 
          backdrop-filter backdrop-blur-lg backdrop-saturate-100 backdrop-contrast-100 
          shadow-xl border border-white/20 text-white 
          transition-all hover:bg-gray-500/10 hover:shadow-2xl z-50
        "
      >
        <FiPlus className="w-3.5 h-3.5" />
      </button>

      <ImportBuildModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </>
  );
};

export default Library;

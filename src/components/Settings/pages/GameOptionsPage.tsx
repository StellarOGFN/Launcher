"use client";

import { useEffect, useState } from "react";
import GlassContainer from "@/components/Global/GlassContainer";
import { Option } from "../Option";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Stellar } from "@/stellar";

const INVENTORY_ITEMS = [
  {
    id: "assault",
    name: "Assault Rifle",
    src: "/slots/T-Icon-Assault-128.png",
  },
  {
    id: "consumable",
    name: "Consumable",
    src: "/slots/T-Icon-Consumable-128.png",
  },
  // {
  //   id: "explosive",
  //   name: "Explosive",
  //   src: "/slots/T-Icon-Explosive-128.png",
  // },
  { id: "pistol", name: "Pistol", src: "/slots/T-Icon-Pistol-128.png" },
  { id: "shotgun", name: "Shotgun", src: "/slots/T-Icon-Shotgun-128.png" },
  { id: "smg", name: "SMG", src: "/slots/T-Icon-SMG-128.png" },
  { id: "sniper", name: "Sniper", src: "/slots/T-Icon-Sniper-128.png" },
  { id: "utility", name: "Utility", src: "/slots/T-Icon-Utility-128.png" },
];

const recordToSwap: Record<string, string> = {
  assault: "Rifle",
  shotgun: "Shotgun",
  smg: "SMG",
  pistol: "Pistol",
  sniper: "Sniper",
  consumable: "Consumable",
  utility: "Utility",
};

export const GameOptionsPage = () => {
  const [preEditsDisabled, setPreEditsDisabled] = useState(
    Stellar.Storage.get("game.disablePreEdits") || false,
  );
  const [resetOnRelease, setResetOnRelease] = useState(
    Stellar.Storage.get("game.resetOnRelease") || false,
  );
  const [bubbleWrapEnabled, setBubbleWrapEnabled] = useState(
    Stellar.Storage.get("game.bubbleWrapEnabled") || false,
  );
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [loadout, setLoadout] = useState<Array<string | null>>(() => {
    return (
      Stellar.Storage.get("game.preferredItemSlots") ?? [
        null,
        null,
        null,
        null,
        null,
      ]
    );
  });

  useEffect(() => {
    Stellar.Storage.set("game.preferredItemSlots", loadout);

    const pairs = loadout
      .map((id, slotIndex) => {
        if (!id) return null;
        const name = recordToSwap[id];
        if (!name) return null;
        return `${name}:${slotIndex + 1}`;
      })
      .filter(Boolean)
      .join(",");

    Stellar.Storage.set("game.preferredItemsCmd", pairs);
  }, [loadout]);

  const handleSlotClick = (index: number) => {
    setSelectedSlot(index);
  };

  const handleItemSelect = (itemId: string) => {
    if (selectedSlot === null) return;

    const newLoadout = [...loadout];

    const currentIndex = newLoadout.indexOf(itemId);
    if (currentIndex !== -1) {
      newLoadout[currentIndex] = null;
    }

    newLoadout[selectedSlot] = itemId;
    setLoadout(newLoadout);
    setSelectedSlot(null);
  };

  const clearSlot = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLoadout = [...loadout];
    newLoadout[index] = null;
    setLoadout(newLoadout);
  };

  const getItemById = (id: string | null) => {
    if (!id) return null;
    return INVENTORY_ITEMS.find((item) => item.id === id);
  };

  return (
    <div className="flex flex-col gap-6 text-white/80">
      <div>
        <h2 className="text-lg font-semibold text-white">Game Options</h2>
        <p className="text-xs text-white/50">
          Configure your game settings and preferences.
        </p>
      </div>

      <div>
        <h3 className="text-md font-semibold text-white mb-3">
          Building Settings
        </h3>
        <GlassContainer className="rounded-lg divide-y divide-white/10">
          <Option
            label="Disable Pre-Edits"
            value={preEditsDisabled}
            onChange={async () => {
              Stellar.Storage.set("game.disablePreEdits", !preEditsDisabled);
              setPreEditsDisabled(!preEditsDisabled);
            }}
          />
          <Option
            label="Reset On Release"
            value={resetOnRelease}
            onChange={async () => {
              Stellar.Storage.set("game.resetOnRelease", !resetOnRelease);
              setResetOnRelease(!resetOnRelease);
            }}
          />
          <Option
            label="Bubble Wrap Builds"
            value={bubbleWrapEnabled}
            onChange={async () => {
              Stellar.Storage.set("game.bubbleWrapEnabled", !bubbleWrapEnabled);
              setBubbleWrapEnabled(!bubbleWrapEnabled);
            }}
          />
        </GlassContainer>
      </div>

      <div>
        <h3 className="text-md font-semibold text-white mb-1">
          Preferred Item Slots
        </h3>
        <p className="text-xs text-white/40 mb-3">
          Click a slot to assign an item, or right-click to clear (If empty, it
          won't be used).
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-7">
          {loadout.map((itemId, index) => {
            const item = getItemById(itemId);

            return (
              <motion.button
                key={index}
                onClick={() => handleSlotClick(index)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  clearSlot(index, e);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
          relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 aspect-square
          ${
            item
              ? "border-white/40 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 hover:border-white/60"
              : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40"
          }
        `}
              >
                <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center border border-white/40">
                  <span className="text-white/70 text-xs font-bold">
                    {index + 1}
                  </span>
                </div>

                {item ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={item.src}
                      alt={item.name}
                      className="w-[85px] h-[85px] object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-white/40 text-3xl">+</span>
                    <span className="text-white/30 text-xs">Select</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedSlot !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={() => setSelectedSlot(null)}
          >
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl"
            >
              <GlassContainer className="rounded-lg overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-gradient-to-r from-white/5 via-transparent to-transparent">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Select Item{" "}
                      <p className="text-sm text-white/50 mt-1">
                        Slot {(selectedSlot ?? 0) + 1}
                      </p>
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-all text-white/60 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="px-4 py-4 max-h-[75vh] overflow-y-auto">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {INVENTORY_ITEMS.map((item) => {
                      const isInLoadout = loadout.includes(item.id);
                      const isCurrentSlot = loadout[selectedSlot] === item.id;

                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => handleItemSelect(item.id)}
                          whileHover={{
                            scale: isInLoadout && !isCurrentSlot ? 1 : 1.08,
                          }}
                          whileTap={{
                            scale: isInLoadout && !isCurrentSlot ? 1 : 0.92,
                          }}
                          disabled={isInLoadout && !isCurrentSlot}
                          className={`
                              relative p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 aspect-square max-h-[135px] min-h-[125px]
                              ${
                                isInLoadout && !isCurrentSlot
                                  ? "border-white/10 bg-white/5 opacity-50 cursor-not-allowed"
                                  : isCurrentSlot
                                    ? "border-white/20 bg-gradient-to-br from-white/10 to-white/10 shadow-lg shadow-white/10"
                                    : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 hover:shadow-lg hover:shadow-white/5"
                              }
                            `}
                        >
                          <img
                            src={item.src}
                            alt={item.name}
                            className="w-14 h-14 object-contain"
                          />
                          <div className="flex flex-col items-center gap-1 h-12">
                            <p className="text-sm font-medium text-white text-center line-clamp-1">
                              {item.name}
                            </p>
                            {isInLoadout && !isCurrentSlot && (
                              <span className="text-xs text-white/50 font-medium">
                                In Use
                              </span>
                            )}
                            {isCurrentSlot && (
                              <span className="text-xs text-white/70 font-medium px-2 py-0.5 rounded bg-white/10 border border-white/20">
                                Selected
                              </span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {loadout[selectedSlot] !== null && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => {
                        const newLoadout = [...loadout];
                        newLoadout[selectedSlot] = null;
                        setLoadout(newLoadout);
                        setSelectedSlot(null);
                      }}
                      className="w-full mt-4 py-3 text-sm font-semibold text-red-300 hover:text-red-200
                               hover:bg-red-950/60 border border-red-500/40 rounded-lg 
                               transition-all duration-200 hover:border-red-500/70"
                    >
                      Clear This Slot
                    </motion.button>
                  )}
                </div>
              </GlassContainer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

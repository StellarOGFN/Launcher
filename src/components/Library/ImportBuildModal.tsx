"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import BuildStore from "@/zustand/BuildStore";
import GlassContainer from "@/components/Global/GlassContainer";
import { HiX } from "react-icons/hi";
import { FiFolder } from "react-icons/fi";
import { StatusOverlay } from "./StatusOverlay";
import { BuildPreview } from "./BuildPreview";
import { VERSION_MAP } from "@/utils/configuration/versionMap";

interface ImportBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportBuildModal: React.FC<ImportBuildModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [buildPath, setBuildPath] = useState("");
  const [buildVersion, setBuildVersion] = useState("");
  const [buildRelease, setBuildRelease] = useState("");
  const [status, setStatus] = useState<
    "idle" | "scanning" | "ready" | "importing" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  const handleBrowse = async () => {
    try {
      const selectedPath = await open({ directory: true, multiple: false });
      if (!selectedPath) return;

      setBuildPath(selectedPath.toString());
      setStatus("scanning");
      setError("");

      const exe = await join(
        selectedPath,
        "FortniteGame",
        "Binaries",
        "Win64",
        "FortniteClient-Win64-Shipping.exe"
      );
      let version = "unknown";
      let release = "unknown net cl";
      const hexCheck = (await invoke("search_for_version", {
        path: exe,
      })) as string[];

      for (const str of hexCheck) {
        const match = str.match(
          /\+\+Fortnite\+Release-(\d+\.\d+|Cert)-CL-(\d+)/
        );
        if (!match) continue;
        if (!str.includes("Live") && !str.includes("Cert")) {
          version =
            match[1].length === 3 && match[1].split(".")[1].length === 1
              ? match[1] + "0"
              : match[1];
          release = `${version}-CL-${match[2]}`;
          break;
        } else {
          const clNum = Number.parseInt(match[2]);
          if (VERSION_MAP[clNum]) {
            version = VERSION_MAP[clNum].v;
            release = VERSION_MAP[clNum].r;
            break;
          }
        }
      }

      setBuildVersion(version);
      setBuildRelease(release);
      setStatus("ready");
    } catch {
      setStatus("error");
      setError("failed to find build version");
    }
  };

  const handleImport = async () => {
    if (!buildPath.trim()) return;
    setStatus("importing");

    try {
      const splash = await join(
        buildPath,
        "FortniteGame",
        "Content",
        "Splash",
        "Splash.bmp"
      );
      const splashExists = await invoke("check_file_exists", { path: splash });

      BuildStore.getState().add(buildPath, {
        splash: splashExists ? convertFileSrc(splash) : "no splash",
        path: buildPath,
        version: buildVersion || "?",
        release: buildRelease || "unk version",
        open: false,
        loading: false,
      });

      setStatus("success");
      setTimeout(handleClose, 1000);
    } catch {
      setStatus("error");
      setError("failed to import build!");
    }
  };

  const handleClose = () => {
    if (["scanning", "importing"].includes(status)) return;
    onClose();
    setBuildPath("");
    setBuildVersion("");
    setBuildRelease("");
    setStatus("idle");
    setError("");
  };

  const isProcessing = ["scanning", "importing"].includes(status);
  const canImport = buildPath.trim() && !isProcessing;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <GlassContainer className="relative w-[480px] border border-white/10 shadow-xl overflow-hidden rounded-md">
              <StatusOverlay
                status={status}
                error={error}
                buildVersion={buildVersion}
                onRetry={() => setStatus("idle")}
              />

              {!buildVersion ? (
                <>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">
                      Import Build
                    </h2>
                    <button
                      onClick={handleClose}
                      disabled={isProcessing}
                      className="p-1 rounded-md hover:bg-white/10 transition-all text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiX className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="px-6 py-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Build Folder
                      </label>
                      <div className="flex gap-3">
                        <div className="flex-1 py-3 px-4 bg-white/5 border border-white/15 text-sm truncate transition-all hover:bg-white/10 hover:border-white/20 rounded-md">
                          {buildPath ? (
                            <span className="text-white">
                              {buildPath.split("\\").pop() || buildPath}
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              No folder selected
                            </span>
                          )}
                        </div>
                        <button
                          onClick={handleBrowse}
                          className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 text-gray-300 hover:text-white transition-all rounded-md flex items-center justify-center"
                        >
                          <FiFolder className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-white/10 flex gap-3">
                    <button
                      onClick={handleClose}
                      disabled={isProcessing}
                      className="flex-1 py-3 rounded-md border border-white/20 text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/30 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={!canImport}
                      className={`flex-1 py-3 text-sm font-medium transition-all rounded-md ${
                        !canImport
                          ? "bg-gray-500/5 bg-clip-padding backdrop-filter backdrop-blur-lg backdrop-saturate-100 backdrop-contrast-100 text-gray-500 cursor-not-allowed border border-white/10"
                          : "bg-gray-500/5 bg-clip-padding backdrop-filter backdrop-blur-lg backdrop-saturate-100 backdrop-contrast-100 shadow-xl border border-white/2 text-white border border-white/25 shadow-lg"
                      }`}
                    >
                      Import
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <BuildPreview
                    buildVersion={buildVersion}
                    buildRelease={buildRelease}
                    onClose={handleClose}
                    isProcessing={isProcessing}
                    status={status}
                  />
                  <div className="px-6 py-4 flex gap-3 bg-black/20 border-t border-white/10">
                    <button
                      onClick={handleClose}
                      disabled={isProcessing}
                      className="flex-1 py-3 rounded-md border border-white/20 text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/30 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={!canImport}
                      className={`flex-1 py-3 text-sm rounded-md font-medium transition-all ${
                        !canImport
                          ? "bg-gray-500/5 bg-clip-padding backdrop-filter backdrop-blur-lg backdrop-saturate-100 backdrop-contrast-100 text-gray-500 cursor-not-allowed border border-white/10"
                          : "bg-gray-500/5 bg-clip-padding backdrop-filter backdrop-blur-lg backdrop-saturate-100 backdrop-contrast-100 shadow-xl border border-white/2 text-white border border-white/25 shadow-lg"
                      }`}
                    >
                      Import
                    </button>
                  </div>
                </>
              )}
            </GlassContainer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImportBuildModal;

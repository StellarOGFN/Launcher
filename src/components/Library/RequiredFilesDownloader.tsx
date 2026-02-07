import React, { useEffect, useState } from "react";
import GlassContainer from "../Global/GlassContainer";
import { invoke } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Stellar } from "@/stellar";

const Files: {
  url: string;
  fileName: string;
  dir?: string;
}[] = [
  {
    url: "https://cdn.stellarfn.dev/Paks/pakchunkStellar-WindowsClient.pak",
    fileName: "pakchunkStellar-WindowsClient.pak",
    dir: "FortniteGame\\Content\\Paks",
  },
  {
    url: "https://cdn.stellarfn.dev/Paks/pakchunkStellar-WindowsClient.sig",
    fileName: "pakchunkStellar-WindowsClient.sig",
    dir: "FortniteGame\\Content\\Paks",
  },
  // {
  //   url: "https://cloud.arc-services.dev/modules/anticheat/Arc.exe",
  //   fileName: "Arc.exe",
  //   dir: "Arc",
  // },
  {
    url: "https://cdn.stellarfn.dev/Arc/Config.json",
    fileName: "Config.json",
    dir: "Arc",
  },
];

interface DownloadProgress {
  downloaded: number;
  total: number;
  percentage: number;
  file_name: string;
}

interface RequiredFilesDownloaderProps {
  buildPath: string;
  onComplete: () => void;
}

const RequiredFilesDownloader: React.FC<RequiredFilesDownloaderProps> = ({
  buildPath,
  onComplete,
}) => {
  const [currentFile, setCurrentFile] = useState("");
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"checking" | "downloading" | "complete">(
    "checking",
  );
  const [amountOfFiles, setAmountOfFiles] = useState(Files.length);

  useEffect(() => {
    const setupListener = async () => {
      const unlisten = await getCurrentWindow().listen<DownloadProgress>(
        "download-progress",
        (event) => {
          setProgress(Math.round(event.payload.percentage));
          setDownloaded(event.payload.downloaded);
          setTotal(event.payload.total);
          setCurrentFile(event.payload.file_name);
        },
      );

      return unlisten;
    };

    let unlisten: (() => void) | null = null;

    setupListener().then((fn) => {
      unlisten = fn;
      checkAndDownloadFiles();
    });

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const checkAndDownloadFiles = async () => {
    try {
      setStatus("checking");
      const filesToDownload: any[] = [];
      const bubble = Stellar.Storage.get<boolean>("game.bubbleWrapEnabled");
      if (bubble) {
        Files.push(
          {
            url: "https://cdn.stellarfn.dev/Paks/pakchunkBubbleWrap-WindowsClient_P.pak",
            fileName: "pakchunkStellarBubble-WindowsClient.pak",
            dir: "FortniteGame\\Content\\Paks",
          },
          {
            url: "https://cdn.stellarfn.dev/Paks/pakchunkBubbleWrap-WindowsClient_P.sig",
            fileName: "pakchunkStellarBubble-WindowsClient.sig",
            dir: "FortniteGame\\Content\\Paks",
          },
        );
      }

      for (const file of Files) {
        const directory = await join(
          buildPath,
          file.dir || "FortniteGame\\Content\\Paks",
        );
        const filePath = await join(directory, file.fileName);

        let expectedSize = 0;
        try {
          expectedSize = (await invoke("get_file_size", {
            url: file.url,
          })) as number;
        } catch (e) {
          expectedSize = 0;
        }

        let needsDownload = true;
        try {
          const exists = (await invoke("check_file_exists_and_size", {
            path: filePath,
            size: expectedSize > 0 ? expectedSize : null,
          })) as boolean;
          needsDownload = !exists;
        } catch (e) {
          needsDownload = true;
        }

        if (needsDownload) {
          filesToDownload.push(file);
        }
      }

      if (filesToDownload.length > 0) {
        await downloadFiles(filesToDownload, buildPath);
        setAmountOfFiles(filesToDownload.length);
      } else {
        setStatus("complete");
        setTimeout(onComplete, 300);
      }
    } catch (error) {
      console.error("err checking files:", error);
      setStatus("complete");
      setTimeout(onComplete, 300);
    }
  };

  const downloadFiles = async (files: any[], buildPath: string) => {
    setStatus("downloading");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFileIndex(i);
      setCurrentFile(file.fileName);
      setProgress(0);
      setDownloaded(0);
      setTotal(0);

      try {
        const directory = await join(
          buildPath,
          file.dir || "FortniteGame\\Content\\Paks",
        );
        const filePath = await join(directory, file.fileName);

        await invoke("download_file_command", {
          url: file.url,
          dest: filePath,
        });
      } catch (error) {
        console.error(`err downloading ${file.fileName}:`, error);
      }
    }

    setStatus("complete");
    setTimeout(onComplete, 500);
  };

  if (status === "complete") return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-md">
      <GlassContainer className="w-[500px] border border-white/10 shadow-xl overflow-hidden rounded-md">
        <div className="p-6 space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-1">
              {status === "checking"
                ? "Verifying Files"
                : "Downloading Required Files"}
            </h2>
            <p className="text-white/60 text-sm">
              {status === "checking"
                ? "Please wait while we verify the required files exist..."
                : `File ${currentFileIndex + 1} of ${amountOfFiles}`}
            </p>
          </div>

          {status === "downloading" && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">{currentFile}</span>
                  <span className="text-white/60">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    style={{
                      background: `
                  radial-gradient(circle at 20% 50%, rgba(115, 113, 223, 0.83), transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(145, 52, 69, 0.3), transparent 50%),
                  radial-gradient(circle at 40% 20%, rgba(10, 114, 158, 0.2), transparent 50%),
                  linear-gradient(135deg, #0f0f1a, #5050b3ff)
                `,
                      width: `${progress}%`,
                    }}
                    className="h-full rounded-full transition-all duration-200"
                  />
                </div>
                <div className="flex justify-between text-xs text-white/50">
                  <span>{formatBytes(downloaded)}</span>
                  <span>{formatBytes(total)}</span>
                </div>
              </div>
            </>
          )}

          {status === "checking" && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </GlassContainer>
    </div>
  );
};

export default RequiredFilesDownloader;

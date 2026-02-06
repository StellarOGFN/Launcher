import { Stellar } from "@/stellar";
import { useAuthStore } from "@/zustand/AuthStore";
import BuildStore, { IBuild } from "@/zustand/BuildStore";
import { useRoutingStore } from "@/zustand/RoutingStore";
import { useToastStore } from "@/zustand/ToastStore";
import { window } from "@tauri-apps/api";
import { invoke } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { sendNotification } from "@tauri-apps/plugin-notification";

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
    {
      url: "https://cloud.arc-services.dev/modules/anticheat/Arc.exe",
      fileName: "Arc.exe",
      dir: "Arc",
    },
    {
      url: "https://cdn.stellarfn.dev/Arc/Config.json",
      fileName: "Config.json",
      dir: "Arc",
    },
  ];

const checkFiles = async (buildPath: string): Promise<boolean> => {
  try {
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
        }
      );
    }
    else {
      await invoke("delete_file", {
        path: await join(
          buildPath,
          "FortniteGame\\Content\\Paks",
          "pakchunkStellarBubble-WindowsClient.pak"
        ),
      }).catch(() => { });
      await invoke("delete_file", {
        path: await join(
          buildPath,
          "FortniteGame\\Content\\Paks",
          "pakchunkStellarBubble-WindowsClient.sig"
        ),
      }).catch(() => { });
    }
    for (const file of Files) {
      const directory = await join(
        buildPath,
        file.dir || "FortniteGame\\Content\\Paks"
      );
      const filePath = await join(directory, file.fileName);

      let expectedSize = 0;
      try {
        expectedSize = (await invoke("get_file_size", {
          url: file.url,
        })) as number;
      } catch (e) {
        console.error("error getting file size for", file.url, e);
        expectedSize = 0;
      }

      try {
        console.log("checking file:", filePath, "size:", expectedSize);
        const exists = (await invoke("check_file_exists_and_size", {
          path: filePath,
          size: expectedSize > 0 ? expectedSize : null,
        })) as boolean;

        if (!exists) {
          return false;
        }
      } catch (e) {
        return false;
      }
    }

    return true;
  } catch (e) {
    return false;
  }
};

let isLaunching = false; // ts so scuff

export const handlePlay = async (
  selectedPath: string,
  onShowDownloader?: (buildPath: string) => void
) => {
  await invoke("exit_all", {});
  setTimeout(async () => {
    const authState = useAuthStore.getState();
    const buildstate = BuildStore.getState();
    const { addToast } = useToastStore.getState();

    if (isLaunching)
      return false;

    isLaunching = true;

    const path = selectedPath.replace("/", "\\");
    const access_token = authState.jwt;

    if (!access_token) {
      addToast("You are not authenticated!", "error");
      isLaunching = false;
      return false;
    }

    const hasRequiredFiles = await checkFiles(selectedPath);
    if (!hasRequiredFiles) {
      if (onShowDownloader) {
        onShowDownloader(selectedPath);
        isLaunching = false;
        return false;
      }
      addToast("Missing required files. Please wait...", "error");
      isLaunching = false;
      return false;
    }

    const exe = await join(
      selectedPath,
      "FortniteGame",
      "Binaries",
      "Win64",
      "FortniteClient-Win64-Shipping.exe"
    );

    const exists = (await invoke("check_file_exists", { path: exe }).catch(
      () => false
    )) as boolean;
    if (!exists) {
      addToast("Build does not exist / is corrupted!", "error");
      isLaunching = false;
      return false;
    }

    const build: IBuild | undefined = buildstate.builds.get(selectedPath);
    if (!build) {
      addToast(`Build with path ${selectedPath} not found!`, "error");
      isLaunching = false;
      return false;
    }

    try {
      BuildStore.setState((state) => {
        const builds = new Map(state.builds);
        const b = builds.get(selectedPath);
        if (b) {
          builds.set(selectedPath, { ...b, loading: true, open: false });
        }
        return { builds };
      });

      const Routing = useRoutingStore.getState();
      const r = Routing.Routes.get("oauth");
      let result = false;

      await Stellar.Requests.get<{ code: string }>((r?.url ?? "") + "/exchange", {
        Authorization: `bearer ${access_token}`,
      }).then(async (res) => {
        if (res.ok) {
          result = true;

          BuildStore.setState((state) => {
            const builds = new Map(state.builds);
            const b = builds.get(selectedPath);
            if (b) {
              builds.set(selectedPath, { ...b, loading: false, open: true });
            }
            return { builds };
          });

          console.log("authenticated with server, launching...");
          let extraArgs: string[] = [];
          const preEdits = Stellar.Storage.get<boolean>("game.disablePreEdits");
          const resetOnRelease = Stellar.Storage.get<boolean>("game.resetOnRelease");
          if (preEdits) {
            extraArgs.push("-dpe");
          }
          if (resetOnRelease) {
            extraArgs.push("-ror");
          }

          const identity = Stellar.Arc_Instance.CreateIdentity(
            "Stellar-Fortnite",
            authState.account?.AccountID ?? "",
            authState.account?.DisplayName ?? ""
          );

          const session = await Stellar.Arc_Instance.CreateAuthSession(identity).catch((e) => {
            console.error("error creating auth session:", e);
            addToast("Failed to authenticate with Arc Services!", "error");
            return null;
          });

          await invoke("launch", {
            code: res.data.code,
            path: path,
            extraArgs,
            identity: session?.auth.token
          });

          window.getCurrentWindow().minimize();
        } else {
          result = false;
          console.log(res.data);
          addToast("Failed to authenticate with server", "error");
        }
      });

      console.log(`launching ${build.version}...`);
      sendNotification({
        title: `Starting ${build.version}`,
        body: `This may take a while so please wait while the game loads!`,
        sound: "Default",
      });

      isLaunching = false;

      return result;
    } catch (error) {
      console.error(`err launching ${build.version}:`, error);
      addToast(`Failed to launch ${build.version}! (DEV: ${error})`, "error");
      isLaunching = false;

      BuildStore.setState((state) => {
        const builds = new Map(state.builds);
        const b = builds.get(selectedPath);
        if (b) {
          builds.set(selectedPath, { ...b, loading: false, open: false });
        }
        return { builds };
      });

      return false;
    }
  }, 2550);
};
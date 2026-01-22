import BuildStore, { IBuild } from "@/zustand/BuildStore";
import { invoke } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { sendNotification } from "@tauri-apps/plugin-notification";

export const handleClose = async (selectedPath: string) => {
  await invoke("exit_all", {});

  const buildstate = BuildStore.getState();

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
    sendNotification({
      title: "Stellar",
      body: "Build does not exist / is corrupted!",
      sound: "Default",
    });
    return false;
  }

  const build: IBuild | undefined = buildstate.builds.get(selectedPath);
  if (!build) {
    sendNotification({
      title: "Stellar",
      body: `Build with path ${selectedPath} not found!`,
      sound: "Default",
    });
    return false;
  }

  try {
    BuildStore.setState((state) => {
      const builds = new Map(state.builds);
      const b = builds.get(selectedPath);
      if (b) {
        builds.set(selectedPath, { ...b, loading: false, open: false });
      }
      return { builds };
    });

  } catch (error) {
    console.error(`error launching ${build.version}:`, error);
    sendNotification({
      title: "Stellar",
      body: `Failed to launch ${build.version}!`,
      sound: "Default",
    });

    build.open = false;
    return false;
  }
};

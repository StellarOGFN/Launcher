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
      sound: "ms-winsoundevent:Notification.Default",
    });
    return false;
  }

  const build: IBuild | undefined = buildstate.builds.get(selectedPath);
  if (!build) {
    sendNotification({
      title: "Stellar",
      body: `Build with path ${selectedPath} not found!`,
      sound: "ms-winsoundevent:Notification.Default",
    });
    return false;
  }

  try {
    build.open = false;
  } catch (error) {
    console.error(`error launching ${build.version}:`, error);
    sendNotification({
      title: "Stellar",
      body: `Failed to launch ${build.version}!`,
      sound: "ms-winsoundevent:Notification.Default",
    });

    build.open = false;
    return false;
  }
};

import {openPath, openUrl, revealItemInDir} from "@tauri-apps/plugin-opener";
import {SEP} from "@/components/tree/tree.ts";
export const shellOpenPath = async (path?: string): Promise<void> => {
  if (!path) return
  return await openPath(path)
}

export const shellOpenUrl = async (path?: string): Promise<void> => {
  if (!path) return
  return await openUrl(path)
}

export const shellShowItemInFolder = async (path?: string) => {
  if (!path) return
  if (path.endsWith(SEP) && path.split(SEP).length <= 2) {
    return await openPath(path)
  }
  return await revealItemInDir(path)
}

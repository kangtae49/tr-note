import { create } from 'zustand'
import {TreeItem} from "@/components/tree/tree.ts";

export type FolderList = TreeItem[]
export interface FolderListStore {
  folderList?: FolderList
  setFolderList: (folderList?: FolderList) => void
}

export const useFolderListStore = create<FolderListStore>((set) => ({
  folderList: undefined,
  setFolderList: (folderList?: FolderList) => set(() => ({ folderList }))
}))

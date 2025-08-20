import { create } from 'zustand'
import {FolderTree} from "@/components/tree/tree.ts";

export interface FolderTreeStore {
  folderTree: FolderTree | undefined
  setFolderTree: (folderTree: FolderTree | undefined) => void
}

export const useFolderTreeStore = create<FolderTreeStore>((set) => ({
  folderTree: undefined,
  setFolderTree: (folderTree: FolderTree | undefined) => set(() => ({ folderTree }))
}))

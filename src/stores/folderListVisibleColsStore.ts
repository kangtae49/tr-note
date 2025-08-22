import { create } from 'zustand'
import {FolderListOrderKey} from "@/components/tree/tree.ts";

export interface FolderListVisibleColsStore {
  folderListVisibleCols: FolderListOrderKey[]
  setFolderListVisibleCols: (folderListVisibleCols: FolderListOrderKey[]) => void
}

export const useFolderListVisibleColsStore = create<FolderListVisibleColsStore>((set) => ({
  folderListVisibleCols: ['Ext', 'Tm', 'Sz'],
  setFolderListVisibleCols: (folderListVisibleCols: FolderListOrderKey[]): void =>
    set(() => ({ folderListVisibleCols }))
}))

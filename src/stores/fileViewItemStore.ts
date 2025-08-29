import { create } from 'zustand'
import {FileViewType} from "@/components/content.ts";
import {TreeItem} from "@/components/tree/tree.ts";


export interface FileViewItem {
  fileViewType: FileViewType
  selectedItem: TreeItem
}

export interface FileViewItemStore {
  fileViewItem: FileViewItem | undefined
  setFileViewItem: (fileViewItem: FileViewItem | undefined) => void
}

export const useFileViewItemStore = create<FileViewItemStore>((set) => ({
  fileViewItem: undefined,
  setFileViewItem: (fileViewItem) => set(() => ({ fileViewItem }))
}))

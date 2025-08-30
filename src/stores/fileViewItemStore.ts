import { create } from 'zustand'
import {FileViewType} from "@/components/content.ts";
import {FileItem} from "@/bindings.ts";


export interface FileViewItem {
  fileViewType: FileViewType
  fileItem: FileItem
  error?: any
}

export interface FileViewItemStore {
  fileViewItem: FileViewItem | undefined
  setFileViewItem: (fileViewItem: FileViewItem | undefined) => void
}

export const useFileViewItemStore = create<FileViewItemStore>((set) => ({
  fileViewItem: undefined,
  setFileViewItem: (fileViewItem) => set(() => ({ fileViewItem }))
}))

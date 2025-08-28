import { create } from 'zustand'
import {FileViewType} from "@/components/content.ts";


export interface FileViewTypeStore {
  fileViewType: FileViewType
  setFileViewType: (fileViewType: FileViewType) => void
}

export const useFileViewTypeStore = create<FileViewTypeStore>((set) => ({
  fileViewType: 'None',
  setFileViewType: (fileViewType) => set(() => ({ fileViewType }))
}))

import { create } from 'zustand'
import {FileViewTypeGroup} from "@/components/content.ts";


export interface FileViewTypeGroupStore {
  fileViewTypeGroup: FileViewTypeGroup
  setFileViewTypeGroup: (fileViewTypeGroup: FileViewTypeGroup) => void
}

export const useFileViewTypeGroupStore = create<FileViewTypeGroupStore>((set) => ({
  fileViewTypeGroup: 'GroupUnknown',
  setFileViewTypeGroup: (fileViewTypeGroup) => set(() => ({ fileViewTypeGroup }))
}))

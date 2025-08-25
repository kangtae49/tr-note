import { create } from 'zustand'
import {defaultFileViewTypeOfGroup, FileViewTypeMap} from "@/components/content.ts";



export interface FileViewTypeMapStore {
  fileViewTypeMap: FileViewTypeMap
  setFileViewTypeMap: (fileViewTypeMap: FileViewTypeMap) => void
}

export const useFileViewTypeMapStore = create<FileViewTypeMapStore>((set) => ({
  fileViewTypeMap: defaultFileViewTypeOfGroup,
  setFileViewTypeMap: (fileViewTypeMap: FileViewTypeMap) => set(() => ({ fileViewTypeMap }))
}))

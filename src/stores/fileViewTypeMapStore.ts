import { create } from 'zustand'
import {FileViewTypeMap} from "@/components/content.ts";



export interface FileViewTypeMapStore {
  fileViewTypeMap: FileViewTypeMap
  setFileViewTypeMap: (fileViewTypeMap: FileViewTypeMap) => void
}

export const useFileViewTypeMapStore = create<FileViewTypeMapStore>((set) => ({
  fileViewTypeMap: {
    Binary: "None",
    Image: "Img",
    Pdf: "Embed",
    Md: "Md",
    Video: "Video",
    Audio: "Audio",
    UnknownEmpty: "Empty",
    UnknownSmall: "Monaco",
    Unknown: "None",
  },
  setFileViewTypeMap: (fileViewTypeMap: FileViewTypeMap) => set(() => ({ fileViewTypeMap }))
}))

import { create } from 'zustand'

export type FileViewType =
  | 'Img'
  | 'Embed'
  | 'Monaco'
  | 'Md'
  | 'Video'
  | 'Audio'
  | 'Empty'
  | 'None'

export type FileViewTypeGroup =
  | 'Binary'
  | 'Image'
  | 'Pdf'
  | 'Md'
  | 'Audio'
  | 'Video'
  | 'UnknownEmpty'
  | 'UnknownSmall'
  | 'Unknown'

export type FileViewTypeGroupMap = {
  [key in FileViewTypeGroup]: FileViewType[];
}

export type FileViewTypeMap = {
  [key in FileViewTypeGroup]: FileViewType;
}

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

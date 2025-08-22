import { create } from 'zustand'

export type DirectoryViewType = 'DirectoryViewType' | 'GalleryViewType'

export interface DirectoryViewTypeStore {
  directoryViewType: DirectoryViewType
  setDirectoryViewType: (directoryViewType: DirectoryViewType) => void
}

export const useDirectoryViewTypeStore = create<DirectoryViewTypeStore>((set) => ({
  directoryViewType: 'DirectoryViewType',
  setDirectoryViewType: (directoryViewType: DirectoryViewType) => set(() => ({ directoryViewType }))
}))

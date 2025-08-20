import { create } from 'zustand'
import { RefObject } from 'react'
import { FixedSizeList as List } from 'react-window'

type FolderTreeRef = RefObject<List | null> | null
export interface FolderTreeRefStore {
  folderTreeRef: FolderTreeRef
  setFolderTreeRef: (folderTreeRef: FolderTreeRef) => void
}

export const useFolderTreeRefStore = create<FolderTreeRefStore>((set) => ({
  folderTreeRef: null,
  setFolderTreeRef: (folderTreeRef: FolderTreeRef) => set(() => ({ folderTreeRef }))
}))

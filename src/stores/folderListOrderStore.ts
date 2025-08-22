import { create } from 'zustand'

export type FolderListOrder = {
  key: FolderListOrderKey
  val: FolderListOrderVal
}
export type FolderListOrderKey = 'Nm' | 'Ext' | 'Tm' | 'Sz'
export type FolderListOrderVal = 'Asc' | 'Desc'

export interface FolderListOrderStore {
  folderListOrder: FolderListOrder
  setFolderListOrder: (folderListOrder: FolderListOrder) => void
}

export const useFolderListOrderStore = create<FolderListOrderStore>((set) => ({
  folderListOrder: { key: 'Nm', val: 'Asc' },
  setFolderListOrder: (folderListOrder: FolderListOrder): void =>
    set(() => ({
      folderListOrder: folderListOrder
    }))
}))

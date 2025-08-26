import {create} from "zustand";

export interface IsResizingStore {
  isResizing: boolean
  setIsResizing: (isResizing: boolean) => void
}

export const useIsResizingStore = create<IsResizingStore>((set) => ({
  isResizing: false,
  setIsResizing: (isResizing) => set(() => ({ isResizing }))
}))
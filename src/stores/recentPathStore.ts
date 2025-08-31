import {create} from "zustand";

export interface RecentPathStore {
  recentPath: string | undefined
  setRecentPath: (recentPath: string | undefined) => void
}

export const useRecentPathStore = create<RecentPathStore>((set) => ({
  recentPath: undefined,
  setRecentPath: (recentPath) => set(() => ({ recentPath }))
}))
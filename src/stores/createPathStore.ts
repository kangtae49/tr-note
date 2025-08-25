import {create} from "zustand";

export interface createPathStore {
  createPath: string | undefined
  setCreatePath: (createPath: string | undefined) => void
}

export const useCreatePathStore = create<createPathStore>((set) => ({
  createPath: undefined,
  setCreatePath: (createPath) => set(() => ({ createPath }))
}))

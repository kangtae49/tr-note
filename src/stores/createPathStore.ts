import {create} from "zustand";

export interface CreatePathStore {
  createPath: string | undefined
  setCreatePath: (createPath: string | undefined) => void
}

export const useCreatePathStore = create<CreatePathStore>((set) => ({
  createPath: undefined,
  setCreatePath: (createPath) => set(() => ({ createPath }))
}))

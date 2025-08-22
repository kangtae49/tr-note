import { create } from 'zustand'
import {TabItem} from "@/bindings.ts";



export interface TabItemsStore {
  tabItems: TabItem[] | undefined
  setTabItems: (tabItems: TabItem[] | undefined) => void
}

export const useTabItemsStore = create<TabItemsStore>((set) => ({
  tabItems: undefined,
  setTabItems: (tabItems: TabItem[] | undefined) => set(() => ({ tabItems }))
}))

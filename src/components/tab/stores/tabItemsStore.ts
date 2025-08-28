import { create } from 'zustand'
import {TabItem} from "@/bindings.ts";
import {getItemId, includesTabItem} from "@/components/tab/tab.ts";


export interface TabItemsStore {
  tabItems: TabItem[] | undefined
  setTabItems: (tabItems: TabItem[] | undefined) => void
}

export const useTabItemsStore = create<TabItemsStore>((set) => ({
  tabItems: undefined,
  setTabItems: (tabItems) => set(() => ({ tabItems }))
}))

export function useTab() {
  const {setTabItems, tabItems} = useTabItemsStore();

  const addTab = (item: TabItem | undefined)=> {
    if (item == undefined) return;
    if (tabItems == undefined) return;
    if (!includesTabItem(item, tabItems)){
      // setTabItems(tabItems.filter((tab) => tab.full_path != item.full_path))
      setTabItems([item, ...tabItems])
    }
    // else {
    // }
  }

  const removeTab = (item: TabItem | undefined) => {
    if (item == undefined) return;
    if (tabItems === undefined) return;
    setTabItems(tabItems.filter((tab: TabItem) => getItemId(tab) !== item.full_path));
  }

  return {
    addTab,
    removeTab,
    setTabItems,
    tabItems
  }

}
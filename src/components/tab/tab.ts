import {TabItem} from "@/components/tab/stores/tabItemsStore.ts";

export const getShortName = (name: string) => {
  const N = 10;
  if (name.length <= (N*3 + 3)) {
    return name;
  }
  return name.slice(0, N)  + '...' + name.slice(-N*2);
}

export const includesTabItem = (tabItem: TabItem | undefined, tabItems: TabItem [] | undefined)=> {
  if (tabItems == undefined) return false;
  if (tabItem == undefined) return false;
  const find = tabItems.find((item) => item === tabItem);
  return find !== undefined;
}
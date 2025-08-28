import {FavoriteItem} from "@/bindings.ts";
import {SEP, TreeItem} from "@/components/tree/tree.ts";

export const getShortName = (fullPath: string) => {
  let name = fullPath.split(SEP).pop() || fullPath.split(SEP).pop();
  if (name == undefined || name == ""){
    name = fullPath;
  }
  const N = 10;
  if (name.length <= (N*3 + 3)) {
    return name;
  }
  return name.slice(0, N)  + '...' + name.slice(-N*2);
}

export const includesFavoriteItem = (favoriteItem: FavoriteItem | undefined, favoriteItems: FavoriteItem [] | undefined)=> {
  if (favoriteItems == undefined) return false;
  if (favoriteItem == undefined) return false;
  const find = favoriteItems.find((item) => item.full_path === favoriteItem.full_path);
  return find !== undefined;
}

export function getItemId (item: FavoriteItem) {
  return item.full_path;
}

export function getFavoriteFromTreeItem(item: TreeItem | undefined): FavoriteItem | undefined {
  if (item === undefined) return undefined;
  return {full_path: item.full_path, dir: item.dir || false}
}

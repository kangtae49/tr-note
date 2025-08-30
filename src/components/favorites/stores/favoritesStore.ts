import { create } from 'zustand'
import {FavoriteItem} from "@/bindings.ts";
import {getItemId, includesPath} from "@/components/tree/tree.ts";


export interface FavoritesStore {
  favorites: FavoriteItem[] | undefined
  setFavorites: (favorites: FavoriteItem[] | undefined) => void
}

export const useFavoritesStore = create<FavoritesStore>((set) => ({
  favorites: undefined,
  setFavorites: (favorites) => set(() => ({ favorites }))
}))


export function useFavorite() {
  const {favorites, setFavorites} = useFavoritesStore();

  const addFavorite = (item: FavoriteItem | undefined)=> {
    if (item == undefined) return;
    if (favorites == undefined) return;
    if (includesPath(item.full_path, favorites)){
      setFavorites(favorites.filter((favorite) => favorite.full_path != item.full_path))
    } else {
      setFavorites([{full_path: item.full_path, dir: item.dir || false}, ...favorites])
    }
  }

  const removeFavorite = (item: FavoriteItem | undefined) => {
    if (item == undefined) return;
    if (favorites === undefined) return;
    setFavorites(favorites.filter((favorite: FavoriteItem) => getItemId(favorite) !== item.full_path));
  }

  return {
    addFavorite,
    removeFavorite,
    favorites,
    setFavorites
  }

}
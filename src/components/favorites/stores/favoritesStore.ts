import { create } from 'zustand'
import {FavoriteItem} from "@/bindings.ts";



export interface FavoritesStore {
  favorites: FavoriteItem[] | undefined
  setFavorites: (favorites: FavoriteItem[] | undefined) => void
}

export const useFavoritesStore = create<FavoritesStore>((set) => ({
  favorites: undefined,
  setFavorites: (favorites) => set(() => ({ favorites }))
}))

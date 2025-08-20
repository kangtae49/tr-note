import { create } from 'zustand'
import {TreeItem} from "@/components/tree/tree.ts";

export interface SelectedTreeItemStore {
  selectedItem?: TreeItem
  setSelectedItem: (selectedItem?: TreeItem) => void
}

export const useSelectedTreeItemStore = create<SelectedTreeItemStore>((set) => ({
  selectedItem: undefined,
  setSelectedItem: (selectedItem?: TreeItem) => set(() => ({ selectedItem }))
}))

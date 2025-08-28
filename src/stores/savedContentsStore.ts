import { create } from "zustand";
import {useContentsStore} from "@/stores/contentsStore.ts";

interface SavedContentsStore <T>{
  savedContents: Map<string, T>;
  setSavedContent: (filepath?: string, content?: T) => void;
  getSavedContent: (filepath?: string) => T;
}

export const useSavedContentsStore = create<SavedContentsStore<unknown>>()((set, get) => ({
  savedContents: new Map(),
  setSavedContent: (filepath, content) =>
    set((state) => {
      if (!filepath) return state;
      const newMap = new Map(state.savedContents);
      newMap.set(filepath, content);
      return { savedContents: newMap };
    }),
  getSavedContent: (filepath) => {
    if (!filepath) return undefined;
    return get().savedContents.get(filepath)
  },
}));

export function useFileSavedContent<T>(filepath: string | undefined) {
  const savedContent = useSavedContentsStore(
    (state) => {
      if (!filepath) return undefined;
      return state.savedContents.get(filepath) as T
    }
  ) as T;

  const removeSavedContent = () => {
    if (filepath === undefined) return;
    useSavedContentsStore.setState((state) => {
      const newMap = new Map(state.savedContents);
      newMap.delete(filepath);
      return { savedContents: newMap };
    });
  }

  const {setSavedContent} = useSavedContentsStore();
  return {
    savedContent,
    setSavedContent: (value: T) => {
      if (filepath === undefined) return;
      setSavedContent(filepath, value)
    },
    removeSavedContent
  };
}



import { create } from "zustand";


interface SaveKeyStore {
  saveKeyMap: Map<string, string>;
  setSaveKeyMap: (saveKeyMap: Map<string, string>) => void;
}

export const useSaveKeyStore = create<SaveKeyStore>((set) => ({
  saveKeyMap: new Map(),
  setSaveKeyMap: (saveKeyMap) => set(() => ({ saveKeyMap }))
}));

export function useSaveKey(filepath: string | undefined) {
  const {saveKeyMap, setSaveKeyMap} = useSaveKeyStore();

  const saveKey = filepath ? saveKeyMap.get(filepath) : undefined;

  const setSaveKey = (saveKey: string) => {
    if (filepath === undefined) return;


    const newMap = new Map(saveKeyMap);
    console.log("save key:", filepath, saveKey);
    newMap.set(filepath, saveKey);
    setSaveKeyMap(newMap)
  }

  return {
    saveKey,
    setSaveKey,
    saveKeyMap,
    setSaveKeyMap
  }
}



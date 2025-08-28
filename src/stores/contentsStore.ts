import { create } from "zustand";

interface ContentsStore <T>{
  contents: Map<string, T>;
  setContent: (filepath?: string, content?: T) => void;
  getContent: (filepath?: string) => T;
}

export const useContentsStore = create<ContentsStore<unknown>>()((set, get) => ({
  contents: new Map(),
  setContent: (filepath, content) =>
    set((state) => {
      if (!filepath) return state;
      const newMap = new Map(state.contents);
      newMap.set(filepath, content);
      return { contents: newMap };
    }),
  getContent: (filepath) => {
    if (!filepath) return undefined;
    return get().contents.get(filepath)
  },
}));

export function useFileContent<T>(filepath: string | undefined) {
  const content = useContentsStore(
    (state) => {
      if (!filepath) return undefined;
      const x = state.contents.get(filepath) as T;
      console.log("get content", filepath, x)
      return x;
    }
  ) as T;
  const setContentS = useContentsStore((state) => state.setContent);

  return {
    content,
    setContent: (value: T) => {
      if (filepath === undefined) return;
      console.log("set content", filepath, value)
      setContentS(filepath, value)
    },
  };
}



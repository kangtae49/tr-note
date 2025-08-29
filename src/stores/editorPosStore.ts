import { create } from "zustand";

export type EditorPos = {
  column?: number
  lineNumber?: number,
  start?: number,
  end?: number
}

interface EditorPosStore {
  editorPosMap: Map<string, EditorPos>;
  setEditorPosMap: (editorPosMap: Map<string, EditorPos>) => void;
}

export const useEditorPosStore = create<EditorPosStore>((set) => ({
  editorPosMap: new Map(),
  setEditorPosMap: (editorPosMap) => set(() => ({ editorPosMap }))
}));

export function useEditorPos(filepath: string | undefined) {
  const {editorPosMap, setEditorPosMap} = useEditorPosStore();

  const editorPos = filepath ? editorPosMap.get(filepath) : undefined;

  const setEditorPos = (editorPos: EditorPos) => {
    if (filepath === undefined) return;

    let newPos = {...editorPos};
    if (newPos.start !== undefined) newPos.start = editorPos.start;
    if (newPos.end !== undefined) newPos.end = editorPos.end;
    if (newPos.column !== undefined) newPos.column = editorPos.column;
    if (newPos.lineNumber !== undefined) newPos.lineNumber = editorPos.lineNumber;

    const newMap = new Map(editorPosMap);
    console.log("save pos:", filepath, newPos);
    newMap.set(filepath, newPos);
    setEditorPosMap(newMap)
  }

  return {
    editorPos,
    setEditorPos,
    editorPosMap,
    setEditorPosMap
  }
}



import React, {useCallback, useEffect, useState} from "react";
import {Excalidraw} from "@excalidraw/excalidraw";
import {OrderedExcalidrawElement, AppState, BinaryFiles} from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";

import {useSaveFile} from "@/components/utils.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";

interface Props {
  style?: React.CSSProperties
}
function ExcalidrawView({ style }: Props) {
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const [initialData, setInitialData] = useState<any>(undefined);
  const [elements, setElements] = useState<OrderedExcalidrawElement[]>([]);
  const [appState, setAppState] = useState<AppState>({});
  const [files, setFiles] = useState<BinaryFiles>({});
  const http = useHttp();
  const {saveFile} = useSaveFile();

  useEffect(() => {
    if (http == undefined) return;
    if (selectedItem == undefined) return;
    if (selectedItem.ext != "excalidraw") return;
    http.getSrcText(selectedItem.full_path).then(text => {
      if (text == "") {
        setInitialData({})
      } else {
        const data = JSON.parse(text);
        if (data.appState) {
          data.appState.collaborators = Array.isArray(data.appState.collaborators)
            ? data.appState.collaborators
            : [];
        }
        const elements = data.elements;
        const appState = data.appState;
        const files = data.files;
        // const appState = {};
        setInitialData({elements, appState, files});
      }
      // setInitialData(data);
    });
  }, [selectedItem])


  const keyDownHandler = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
      e.preventDefault();
      e.stopPropagation();
      console.log('handleKeyDown');
      if (selectedItem == undefined) return;

      const jsonString = JSON.stringify({ elements, appState, files }, null, 2);

      saveFile(jsonString).then((_item) => {
        console.log('saveFile done');
      });
    }
  }, [selectedItem, elements, appState, files])
  if (initialData == undefined) {
    return <div className='excalidraw-view'></div>
  }

  return (
    <div className="excalidraw-view" style={style} tabIndex={0} onKeyDownCapture={keyDownHandler}>
      <Excalidraw
        key={selectedItem?.full_path}
        initialData={initialData}
        onChange={(elements, state, files) => {
          setElements(elements);
          setAppState(state);
          setFiles(files);
        }}
      />
    </div>
  )
}

export default ExcalidrawView;
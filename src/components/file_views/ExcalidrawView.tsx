import React, {useCallback, useEffect, useState} from "react";
import {Excalidraw} from "@excalidraw/excalidraw";
import {type OrderedExcalidrawElement} from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";
import { getAllWindows } from '@tauri-apps/api/window';

import {useSaveFile} from "@/components/utils.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";

interface Props {
  style?: React.CSSProperties
  fullscreenHandler?: (e: any) => Promise<void>
}
function ExcalidrawView({ style, fullscreenHandler }: Props) {
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const http = useHttp();
  const {saveFile} = useSaveFile();
  const [initialData, setInitialData] = useState<any>(undefined);
  const [elements, setElements] = useState<readonly OrderedExcalidrawElement[]>([]);
  const [appState, setAppState] = useState<any>({});
  const [files, setFiles] = useState<any>({});

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
        setInitialData({elements, appState, files});
      }
    });
  }, [selectedItem])



  const keyDownHandler = useCallback(async (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
      e.preventDefault();
      e.stopPropagation();
      console.log('handleKeyDown');
      if (selectedItem == undefined) return;

      const jsonString = JSON.stringify({elements, appState, files}, null, 2);

      saveFile(jsonString).then((_item) => {
        console.log('saveFile done');
      });
    } else if (fullscreenHandler !== undefined) {
      await fullscreenHandler(e);
    }

  }, [selectedItem, elements, appState, files, fullscreenHandler])

  if (initialData == undefined) {
    return <div className='excalidraw-view'></div>
  }

  return (
    <div className="excalidraw-view"
         style={style}
         tabIndex={0}
         onKeyDownCapture={keyDownHandler}
    >
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
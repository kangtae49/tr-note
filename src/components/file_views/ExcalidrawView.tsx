import React, {useCallback, useEffect, useState} from "react";
import {Excalidraw} from "@excalidraw/excalidraw";
import {OrderedExcalidrawElement, AppState, BinaryFiles} from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";
import { getAllWindows } from '@tauri-apps/api/window';

import {useSaveFile} from "@/components/utils.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";

interface Props {
  style?: React.CSSProperties
}
function ExcalidrawView({ style }: Props) {
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const http = useHttp();
  const {saveFile} = useSaveFile();
  const [initialData, setInitialData] = useState<any>(undefined);
  const [elements, setElements] = useState<OrderedExcalidrawElement[]>([]);
  const [appState, setAppState] = useState<AppState>({});
  const [files, setFiles] = useState<BinaryFiles>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newStyle, setNewStyle] = useState<React.CSSProperties>(style);

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

  useEffect(() => {
    if (isFullscreen) {
      setNewStyle({
        ...style,
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        background: "white"
      })
    } else {
      setNewStyle({
        ...style,
      })
    }
  }, [isFullscreen]);

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
    } else if (e.code === "Escape") {
      e.preventDefault();
      if (isFullscreen){
        const appWindows = await getAllWindows();
        const appWindow = appWindows[0];
        await appWindow.setFullscreen(false);
        setIsFullscreen(false);
      }
    } else if (e.code === "F11") {
      e.preventDefault();
      // setIsFullscreen(!isFullscreen);
      const appWindows = await getAllWindows();
      const appWindow = appWindows[0];
      if (isFullscreen){
        await appWindow.setFullscreen(false);
      } else {
        // await document.exitFullscreen();
        await appWindow.setFullscreen(true);
      }
      setIsFullscreen(!isFullscreen);
    }
  }, [selectedItem, elements, appState, files, isFullscreen])

  // useEffect(() => {
  //   if (document.fullscreenElement == null){
  //
  //   } else {
  //     await document.exitFullscreen();
  //   }
  //   if (isFullscreen) {
  //     appWindow.setFullScreen(true);
  //   } else {
  //     appWindow.setFullScreen(false);
  //   }
  //
  // }, [isFullscreen]);

  if (initialData == undefined) {
    return <div className='excalidraw-view'></div>
  }

  return (
    <div className="excalidraw-view"
         style={newStyle}
         tabIndex={0}
         onKeyDownCapture={keyDownHandler}>
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
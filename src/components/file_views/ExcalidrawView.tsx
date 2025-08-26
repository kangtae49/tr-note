import React, {useCallback, useEffect, useState} from "react";
import {Excalidraw} from "@excalidraw/excalidraw";
import {type OrderedExcalidrawElement} from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";

import {useSaveFile} from "@/components/utils.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {TreeItem} from "@/components/tree/tree.ts";
import {useFileContent} from "@/stores/contentsStore.ts";
import {AppState, BinaryFiles} from "@excalidraw/excalidraw/types";

interface Props {
  style?: React.CSSProperties
  selectedItem?: TreeItem
  fullscreenHandler?: (e: any) => Promise<void>
}

interface ContentType {
  elements?: readonly OrderedExcalidrawElement[];
  appState?: any;
  files?: any;
}

function textToContent(text: string): ContentType {
  try {
    const data = JSON.parse(text) as ContentType;
    if (data.appState) {
      data.appState.collaborators = Array.isArray(data.appState.collaborators)
        ? data.appState.collaborators
        : [];
    }
    const elements = data.elements;
    const appState = data.appState;
    const files = data.files;
    return {elements, appState, files};
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return {};
  }
}

function ExcalidrawView({ style, selectedItem, fullscreenHandler }: Props) {
  const http = useHttp();
  const {saveFile} = useSaveFile();
  // const [initialData, setInitialData] = useState<any>(undefined);
  // const [elements, setElements] = useState<readonly OrderedExcalidrawElement[]>([]);
  // const [appState, setAppState] = useState<any>({});
  // const [files, setFiles] = useState<any>({});

  const {content, setContent} = useFileContent<string | undefined>(selectedItem?.full_path);

  useEffect(() => {
    if (http == undefined) return;
    if (selectedItem == undefined) return;
    if (selectedItem.ext != "excalidraw") return;
    console.log('draw load')
    if (content == undefined) {
      http.getSrcText(selectedItem.full_path).then(text => {
        if (text == "") {
          // setInitialData({})
          setContent({})
        } else {
          const data = JSON.parse(text) as ContentType;
          // if (data.appState) {
          //   data.appState.collaborators = Array.isArray(data.appState.collaborators)
          //     ? data.appState.collaborators
          //     : [];
          // }
          const elements = data.elements;
          const appState = data.appState;
          const files = data.files;
          setContent(text)
          // setInitialData({elements, appState, files});
        }
      });
    }
  }, [selectedItem])

  const onChangeContent = (elements: readonly OrderedExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
    // setContent({elements, appState, files})
    const jsonString = JSON.stringify({elements, appState, files}, null, 2);
    setContent(jsonString);
  }

  // const onChangeContent = (value: string | undefined) => {
  //   if (value == undefined) return;
  //   setContent(value);
  // }
  const keyDownHandler = useCallback(async (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
      e.preventDefault();
      e.stopPropagation();
      console.log('handleKeyDown');
      if (selectedItem == undefined) return;

      // const jsonString = JSON.stringify(content, null, 2);

      saveFile(content).then((_item) => {
        console.log('saveFile done');
      });
    } else if (fullscreenHandler !== undefined) {
      await fullscreenHandler(e);
    }

  }, [selectedItem, content, fullscreenHandler])

  if (content == undefined) {
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
        initialData={textToContent(content)}
        onChange={onChangeContent}
      />
    </div>
  )
}

export default ExcalidrawView;
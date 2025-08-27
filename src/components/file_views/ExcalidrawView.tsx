import React, {useCallback, useEffect} from "react";
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
    const elements = data.elements;
    const appState = data.appState;
    const files = data.files;

    let newAppState = appState;
    if (appState.collaborators && typeof appState.collaborators === 'object' && !Array.isArray(appState.collaborators)) {
      newAppState = {
        ...appState,
        collaborators: new Map(Object.entries(appState.collaborators))
      };
    }

    return {elements, appState: newAppState, files};
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return {};
  }
}

function ExcalidrawView({ style, selectedItem, fullscreenHandler }: Props) {
  if (selectedItem?.ext != "excalidraw") return null;
  const http = useHttp();
  const {saveFile} = useSaveFile();

  const {content, setContent} = useFileContent<string | undefined>(selectedItem?.full_path);

  useEffect(() => {
    if (http == undefined) return;
    if (selectedItem == undefined) return;
    if (selectedItem.ext != "excalidraw") return;
    console.log('draw load')
    if (content == undefined) {
      http.getSrcText(selectedItem.full_path).then(text => {
        if (text == "") {
          setContent(JSON.stringify({elements: [], appState: {}, files: {}}, null, 2))
        } else {
          setContent(text)
        }
      });
    }
  }, [])

  const onChangeContent = (elements: readonly OrderedExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
    const jsonString = JSON.stringify({elements, appState, files}, null, 2);
    setContent(jsonString);
  }

  const keyDownHandler = useCallback(async (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
      e.preventDefault();
      e.stopPropagation();
      console.log('handleKeyDown');
      if (selectedItem == undefined) return;

      if (content !== undefined) {
        saveFile(content).then((_item) => {
          console.log('saveFile done');
        });
      }
    } else if (fullscreenHandler !== undefined) {
      await fullscreenHandler(e);
    }

  }, [content, fullscreenHandler])

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
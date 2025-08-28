import React, {memo, useCallback, useEffect, useRef} from "react";
import {Excalidraw} from "@excalidraw/excalidraw";
import {type OrderedExcalidrawElement} from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";

import {useSaveFile} from "@/components/utils.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {TreeItem} from "@/components/tree/tree.ts";
import {AppState, BinaryFiles} from "@excalidraw/excalidraw/types";
import {useTab} from "@/components/tab/stores/tabItemsStore.ts";
import {getTabFromTreeItem} from "@/components/tab/tab.ts";
import {useFileContent} from "@/stores/contentsStore.ts";
import {useFileSavedContent} from "@/stores/savedContentsStore.ts";

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

function textToContent(text: string | undefined): ContentType | undefined {
  if (text == undefined) return undefined;
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
  const http = useHttp();
  const {content, setContent} = useFileContent<string | undefined>(selectedItem?.full_path);
  const {setSavedContent} = useFileSavedContent<string | undefined>(selectedItem?.full_path);
  const {saveFile} = useSaveFile();
  const {addTab} = useTab();

  const keyDownHandler = useCallback(async (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
      e.preventDefault();
      e.stopPropagation();
      console.log('handleKeyDown');
      if (selectedItem == undefined) return;

      if (content !== undefined) {
        saveFile(content).then((_item) => {
          console.log('saveFile done');
          setSavedContent(content);
        });
      }
    } else if (fullscreenHandler !== undefined) {
      await fullscreenHandler(e);
    }

  }, [content, fullscreenHandler])

  const onChangeContent = (elements: readonly OrderedExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
    console.log('onChange excalidraw', {elements, appState, files})
    const jsonString = JSON.stringify({elements, appState, files}, null, 2);
    if (jsonString !== content) {
      setContent(jsonString);
      addTab(getTabFromTreeItem(selectedItem))
    }
  }

  useEffect(() => {
    if (http !== undefined && selectedItem !== undefined && content == undefined) {
      http.getSrcText(selectedItem.full_path).then(text => {
        console.log('getSrcText excalidraw:', text);
        let content = text;
        if (text == "") {
          content = JSON.stringify({elements: [], appState: {}, files: {}}, null, 2)
        }
        setContent(content)
        setSavedContent(content);
      });
    }
  }, [selectedItem, http]);


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

export default memo(ExcalidrawView);
import React, {useCallback} from "react";
import {Excalidraw} from "@excalidraw/excalidraw";
import {type OrderedExcalidrawElement} from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";

import {useSaveFile} from "@/components/utils.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {AppState, BinaryFiles} from "@excalidraw/excalidraw/types";
import {useTab} from "@/components/tab/stores/tabItemsStore.ts";
import {getTabFromFileItem} from "@/components/tab/tab.ts";
import {useFileContent} from "@/stores/contentsStore.ts";
import {useFileSavedContent} from "@/stores/savedContentsStore.ts";
import {ErrorBoundary} from "react-error-boundary";
import {FileViewProps} from "@/components/FileView.tsx";


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
    // return {};
    return undefined;
  }
}

function ExcalidrawView({ style, fileItem, fullscreenHandler }: FileViewProps) {
  const http = useHttp();
  const {content, setContent} = useFileContent<string | undefined>(fileItem?.full_path);
  const {setSavedContent} = useFileSavedContent<string | undefined>(fileItem?.full_path);
  const {saveFile} = useSaveFile();
  const {addTab} = useTab();
  // const {fileViewType} = useFileViewTypeStore();

  const keyDownHandler = useCallback(async (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
      e.preventDefault();
      e.stopPropagation();
      console.log('handleKeyDown');
      if (fileItem == undefined) return;

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
    const jsonString = JSON.stringify({elements, appState, files}, null, 2);
    if (jsonString !== content) {
      setContent(jsonString);
      addTab(getTabFromFileItem(fileItem))
    }
  }


  if (http !== undefined && fileItem !== undefined && content == undefined) {
    http.getSrcText(fileItem.full_path).then(text => {
      let content = text;
      if (text == "") {
        content = JSON.stringify({elements: [], appState: {}, files: {}}, null, 2)
      }
      setContent(content)
      setSavedContent(content);
    });
  }



  if (content == undefined) {
    return <div className='excalidraw-view'></div>
  }

  return (
    <div className="excalidraw-view"
         style={style}
         tabIndex={0}
         onKeyDownCapture={keyDownHandler}
    >
      <ErrorBoundary fallback={<div>Error</div>}>
        <Excalidraw
          key={fileItem?.full_path}
          initialData={textToContent(content)}
          onChange={onChangeContent}
        />
      </ErrorBoundary>
    </div>
  )
}

export default ExcalidrawView;
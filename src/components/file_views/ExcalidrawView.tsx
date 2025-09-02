import React, {useCallback} from "react";
import {Excalidraw} from "@excalidraw/excalidraw";
import {type OrderedExcalidrawElement} from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";

import {useSaveFile} from "@/components/utils.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {AppState, BinaryFiles} from "@excalidraw/excalidraw/types";
import {useTab} from "@/components/tab/stores/tabItemsStore.ts";
import {useFileContent} from "@/stores/contentsStore.ts";
import {useFileSavedContent} from "@/stores/savedContentsStore.ts";
import {ErrorBoundary} from "react-error-boundary";
import {FileViewProps} from "@/components/FileView.tsx";
import {TabItem} from "@/bindings.ts";


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
  const {savedContent, setSavedContent} = useFileSavedContent<string | undefined>(fileItem?.full_path);
  const {saveFile} = useSaveFile();
  const {addTab} = useTab();

  const keyDownHandler = useCallback(async (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
      e.preventDefault();
      e.stopPropagation();
      console.log('handleKeyDown');
      if (fileItem == undefined) return;

      if (content !== undefined) {
        saveFile(content).then((_item) => {
          console.log('saveFile done');
          setContent(content);
          setSavedContent(content);
        });
      }
    } else if (fullscreenHandler !== undefined) {
      await fullscreenHandler(e);
    }

  }, [content, savedContent, fullscreenHandler])

  const onChangeContent = (elements: readonly OrderedExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
    const jsonString = JSON.stringify({elements, appState, files}, null, 2);
    if (!equalsContent(jsonString, content)) {
      setContent(jsonString);
      addTab(fileItem as TabItem)
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
          initialData={textToContent(content)}
          onChange={onChangeContent}
        />
      </ErrorBoundary>
    </div>
  )
}

export default ExcalidrawView;


export function equalsContent(a: string | undefined, b: string | undefined) {
  if (a == undefined || b == undefined) return false;
  const a_data = JSON.parse(a) as ContentType;
  const a_elements = a_data.elements;
  const a_files = a_data.files;
  const a_elements_str = JSON.stringify(a_elements);
  const a_files_str = JSON.stringify(a_files);

  const b_data = JSON.parse(b) as ContentType;
  const b_elements = b_data.elements;
  const b_files = b_data.files;
  const b_elements_str = JSON.stringify(b_elements);
  const b_files_str = JSON.stringify(b_files);
  return a_elements_str == b_elements_str && a_files_str == b_files_str
}
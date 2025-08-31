// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

import {FileViewProps} from "@/components/FileView.tsx";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useSaveFile} from "@/components/utils.ts";
import {useFileContent} from "@/stores/contentsStore.ts";
import {useFileSavedContent} from "@/stores/savedContentsStore.ts";
import {useTab} from "@/components/tab/stores/tabItemsStore.ts";
import React, {useCallback} from "react";
import {TabItem} from "@/bindings.ts";

function QuillView({ style, fileItem, fullscreenHandler }: FileViewProps) {
  const http = useHttp();
  const {saveFile} = useSaveFile();
  const {content, setContent} = useFileContent<string | undefined>(fileItem?.full_path);
  const {setSavedContent} = useFileSavedContent<string | undefined>(fileItem?.full_path);
  const {addTab} = useTab();

  const keyDownHandler = useCallback(async (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
      e.preventDefault();
      console.log('handleKeyDown');
      if (fileItem == undefined) return;
      if (content == undefined) return;
      saveFile(content).then((_item) => {
        console.log('saveFile done');
        setContent(content);
        setSavedContent(content);
      });
    } else if (fullscreenHandler !== undefined) {
      await fullscreenHandler(e);
    }
  }, [content, fullscreenHandler])

  const onChangeContent = (value: string | undefined) => {
    if (value == undefined) return;
    console.log('onChange md')
    setContent(value);
    addTab(fileItem as TabItem)
  }

  if (http !== undefined && fileItem !== undefined && content == undefined) {
    http.getSrcText(fileItem.full_path).then(text => {
      console.log('getSrcText html');
      setContent(text);
      setSavedContent(text);
    });
  }

  return (
    <div className="quill-view"
         style={style}
         tabIndex={0}
         onKeyDownCapture={keyDownHandler}
    >
      {/*<ReactQuill*/}
      {/*  theme="snow"*/}
      {/*  value={content}*/}
      {/*  onChange={onChangeContent}*/}
      {/*/>*/}

    </div>
  )
}

export default QuillView;

import React, {useCallback, useEffect} from "react";
import MDEditor, {commands, ExecuteState, TextAreaTextApi} from '@uiw/react-md-editor';
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useSaveFile} from "@/components/utils.ts";
import {MdPreviewType, useMdPreviewTypeStore} from "@/stores/mdPreviewTypeStore.ts";
import {useFileContent} from "@/stores/contentsStore.ts";
import {useTab} from "@/components/tab/stores/tabItemsStore.ts";
import {useFileSavedContent} from "@/stores/savedContentsStore.ts";
import {ErrorBoundary} from "react-error-boundary";
import {FileViewProps} from "@/components/FileView.tsx";
import {TabItem} from "@/bindings.ts";


function MdView({ style, fileItem, fullscreenHandler }: FileViewProps) {
  const http = useHttp();
  const {saveFile} = useSaveFile();
  const {mdPreviewType, setMdPreviewType} = useMdPreviewTypeStore();
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

  const handlePreviewTypeClick = useCallback((state: ExecuteState, api: TextAreaTextApi) => {
    console.log("click previewType:", state.command.name);
    if (commands.codeEdit.execute) {
      commands.codeEdit.execute(state, api);
    }
    if (state.command.name !== undefined) {
      setMdPreviewType(state.command.name as MdPreviewType);
    }
  }, [fileItem, mdPreviewType]);

  const onChangeContent = (value: string | undefined) => {
    if (value == undefined) return;
    console.log('onChange md')
    setContent(value);
    addTab(fileItem as TabItem)
  }

  useEffect(() => {
    const btn = document.querySelector(`.md-view button[data-name="${mdPreviewType}"]`) as HTMLButtonElement;
    if (btn) {
      console.log('click');
      btn.click();
    }
  }, [])

  if (http !== undefined && fileItem !== undefined && content == undefined) {
    http.getSrcText(fileItem.full_path).then(text => {
      console.log('getSrcText md');
      setContent(text);
      setSavedContent(text);
    });
  }

  return (
    <div className="md-view"
         style={style}
         tabIndex={0}
         onKeyDownCapture={keyDownHandler}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <MDEditor
          value={content}
          preview={undefined}
          onChange={onChangeContent}
          extraCommands = {[
              { ...commands.codeEdit, execute: handlePreviewTypeClick },
              { ...commands.codeLive, execute: handlePreviewTypeClick },
              { ...commands.codePreview, execute: handlePreviewTypeClick },
          ]}
          height="100%"
        />
      </ErrorBoundary>
    </div>
  )
}

export default MdView;
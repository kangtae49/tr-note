import React, {useCallback, useEffect} from "react";
import MDEditor, {commands, ExecuteState, TextAreaTextApi} from '@uiw/react-md-editor';
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useSaveFile} from "@/components/utils.ts";
import {useFolderTreeStore} from "@/components/tree/stores/folderTreeStore.ts";
import {MdPreviewType, useMdPreviewTypeStore} from "@/stores/mdPreviewTypeStore.ts";
import {TreeItem} from "@/components/tree/tree.ts";
import {useFileContent} from "@/stores/contentsStore.ts";
import {useTab} from "@/components/tab/stores/tabItemsStore.ts";
import {getTabFromTreeItem} from "@/components/tab/tab.ts";
import {useFileSavedContent} from "@/stores/savedContentsStore.ts";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  style?: React.CSSProperties
  selectedItem?: TreeItem
  fullscreenHandler?: (e: any) => Promise<void>
}

function MdView({ style, selectedItem, fullscreenHandler }: Props) {
  const http = useHttp();
  const {saveFile} = useSaveFile();
  const {folderTree} = useFolderTreeStore()
  const {mdPreviewType, setMdPreviewType} = useMdPreviewTypeStore();
  const {content, setContent} = useFileContent<string | undefined>(selectedItem?.full_path);
  const {setSavedContent} = useFileSavedContent<string | undefined>(selectedItem?.full_path);
  const {addTab} = useTab();

  const keyDownHandler = useCallback(async (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
      e.preventDefault();
      console.log('handleKeyDown');
      if (selectedItem == undefined) return;
      if(folderTree == undefined) return;
      if (content == undefined) return;
      saveFile(content).then((_item) => {
        console.log('saveFile done');
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
  }, [selectedItem, mdPreviewType]);

  const onChangeContent = (value: string | undefined) => {
    if (value == undefined) return;
    console.log('onChange md')
    setContent(value);
    addTab(getTabFromTreeItem(selectedItem))
  }

  useEffect(() => {
    const btn = document.querySelector(`.md-view button[data-name="${mdPreviewType}"]`) as HTMLButtonElement;
    if (btn) {
      console.log('click');
      btn.click();
    }
  }, [])

  if (http !== undefined && selectedItem !== undefined && content == undefined) {
    http.getSrcText(selectedItem.full_path).then(text => {
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
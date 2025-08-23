import React, {useCallback, useEffect, useState} from "react";
import MDEditor, {commands } from '@uiw/react-md-editor';
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useSaveFile} from "@/components/utils.ts";
import {useFolderTreeStore} from "@/components/tree/stores/folderTreeStore.ts";
import {useMdPreviewTypeStore} from "@/stores/mdPreviewTypeStore.ts";

interface Props {
  style?: React.CSSProperties
}

function MdView({ style }: Props) {
  const folderTree = useFolderTreeStore((state) => state.folderTree)
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const mdPreviewType = useMdPreviewTypeStore((state) => state.mdPreviewType);
  const setMdPreviewType = useMdPreviewTypeStore((state) => state.setMdPreviewType);
  const [content, setContent] = useState<string | undefined>(undefined);
  const http = useHttp();
  const {saveFile} = useSaveFile();

  useEffect(() => {
    if (http == undefined) return;
    if (selectedItem == undefined) return;
    http.getSrcText(selectedItem.full_path).then(text => {
      setContent(text);
    });
  }, [selectedItem])


  const keyDownHandler = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
      e.preventDefault();
      console.log('handleKeyDown');
      if (selectedItem == undefined) return;
      if(folderTree == undefined) return;
      if (content == undefined) return;
      saveFile(content).then((_item) => {
        console.log('saveFile done');
      });
    }
  }, [selectedItem, content])

  const handleEditClick = (state: any, api: any) => {
    console.log("edit clicked", state);
    setMdPreviewType(state.command.name);
    if (commands.codeEdit.execute) {
      commands.codeEdit.execute(state, api);
    }
  };

  const handlePreviewClick = (state: any, api: any) => {
    console.log("preview clicked", state);
    setMdPreviewType(state.command.name);
    if (commands.codePreview.execute) {
      commands.codePreview.execute(state, api);
    }
  };

  const handleLiveClick = (state: any, api: any) => {
    console.log("live clicked", state);
    setMdPreviewType(state.command.name);
    if (commands.codeLive.execute) {
      commands.codeLive.execute(state, api);
    }
  };



  return (
    <div className="md-view" style={style} tabIndex={0} onKeyDownCapture={keyDownHandler}>
      <MDEditor
        value={content}
        preview={mdPreviewType}
        onChange={setContent}
        extraCommands = {[
            { ...commands.codeEdit, execute: handleEditClick },
            { ...commands.codeLive, execute: handleLiveClick },
            { ...commands.codePreview, execute: handlePreviewClick },
        ]}
        height="100%"
      />
    </div>
  )
}

export default MdView;
import React, {useCallback, useEffect, useState} from "react";
import MDEditor, {commands } from '@uiw/react-md-editor';
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useSaveFile} from "@/components/utils.ts";
import {useFolderTreeStore} from "@/components/tree/stores/folderTreeStore.ts";
import {useMdPreviewTypeStore} from "@/stores/mdPreviewTypeStore.ts";
import {getAllWindows} from "@tauri-apps/api/window";

interface Props {
  style?: React.CSSProperties
}

function MdView({ style }: Props) {
  const http = useHttp();
  const {saveFile} = useSaveFile();
  const folderTree = useFolderTreeStore((state) => state.folderTree)
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const mdPreviewType = useMdPreviewTypeStore((state) => state.mdPreviewType);
  const setMdPreviewType = useMdPreviewTypeStore((state) => state.setMdPreviewType);
  const [content, setContent] = useState<string | undefined>(undefined);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newStyle, setNewStyle] = useState<React.CSSProperties | undefined>({});


  useEffect(() => {
    if (http == undefined) return;
    if (selectedItem == undefined) return;
    http.getSrcText(selectedItem.full_path).then(text => {
      setContent(text);
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
    }
  }, [isFullscreen]);

  const keyDownHandler = useCallback(async (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
      e.preventDefault();
      console.log('handleKeyDown');
      if (selectedItem == undefined) return;
      if(folderTree == undefined) return;
      if (content == undefined) return;
      saveFile(content).then((_item) => {
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
  }, [selectedItem, content, isFullscreen])

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
    <div className="md-view"
         style={isFullscreen ? newStyle :style}
         tabIndex={0}
         onKeyDownCapture={keyDownHandler}>
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
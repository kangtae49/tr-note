import "@/components/file.css"
import {useFileViewTypeMapStore} from "@/stores/fileViewTypeMapStore.ts";
import React, {useCallback, useEffect, useState} from "react";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";

import ImageView from "@/components/file_views/ImageView.tsx";
import EmbedView from "@/components/file_views/EmbedView.tsx";
import MdView from "@/components/file_views/MdView.tsx";
import AudioView from "@/components/file_views/AudioView.tsx";
import VideoView from "@/components/file_views/VideoView.tsx";
import MonacoView from "@/components/file_views/MonacoView.tsx";
import NoneView from "@/components/file_views/NoneView.tsx";
import ExcalidrawView from "@/components/file_views/ExcalidrawView.tsx";

import AutoSizer from "react-virtualized-auto-sizer";
import {FileViewType, getFileViewTypeGroup} from "@/components/content.ts";
import {LIST_HEAD_SIZE, TreeItem} from "@/components/tree/tree.ts";
import {getAllWindows} from "@tauri-apps/api/window";
import {useFileViewTypeStore} from "@/stores/fileViewTypeStore.ts";
import {ErrorBoundary} from "react-error-boundary";
import {useFileViewItemStore} from "@/stores/fileViewItemStore.ts";


interface Props {
  style?: React.CSSProperties
  selectedItem?: TreeItem
  fullscreenHandler?: (e: any) => Promise<void>
}



function FileView() {
  const {fileViewTypeMap} = useFileViewTypeMapStore()
  const {selectedItem} = useSelectedTreeItemStore()
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newStyle, setNewStyle] = useState<React.CSSProperties | undefined>({});
  const {fileViewType} = useFileViewTypeStore()
  const {fileViewItem} = useFileViewItemStore()

  const fullscreenHandler = useCallback(async (e: React.KeyboardEvent) => {
    if (e.code === "Escape") {
      e.preventDefault();
      if (isFullscreen){
        const appWindows = await getAllWindows();
        const appWindow = appWindows[0];
        await appWindow.setFullscreen(false);
        setIsFullscreen(false);
      }
    } else if (e.code === "F11") {
      e.preventDefault();
      const appWindows = await getAllWindows();
      const appWindow = appWindows[0];
      if (isFullscreen){
        await appWindow.setFullscreen(false);
        // const container = (e.target as HTMLElement).parentElement;
        // const embed = container?.querySelector("embed");
        // if (embed) {
        //   await document.exitFullscreen();
        // }
      } else {
        await appWindow.setFullscreen(true);
        // const container = (e.target as HTMLElement).parentElement;
        // const embed = container?.querySelector("embed");
        // if (embed) {
        //   await embed.requestFullscreen();
        // }
      }
      setIsFullscreen(!isFullscreen);
    }
  }, [selectedItem, fileViewType, isFullscreen])


  // useEffect(() =>{
  //   getFileViewTypeGroup(selectedItem).then((fileViewTypeGroup) => {
  //     const fileViewType = fileViewTypeMap[fileViewTypeGroup];
  //     if (selectedItem !== undefined) {
  //       setPairFileItem({fileViewType, selectedItem});
  //     } else {
  //       setPairFileItem(undefined);
  //     }
  //   })
  // }, [selectedItem, fileViewType])

  useEffect(() => {
    if (isFullscreen) {
      setNewStyle({
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        zIndex: 9999,
        background: "white"
      })
    }
  }, [isFullscreen]);

  if (fileViewItem === undefined) return null;
  return (
    <div className="file-view">
      <AutoSizer>
        {({ height, width }) => {
          const props: Props = {
            selectedItem: fileViewItem.selectedItem,
            fullscreenHandler
          }
          return(
          <>
            {fileViewItem.fileViewType === 'None' && <NoneView style={isFullscreen ? newStyle : {width, height: height - LIST_HEAD_SIZE}} {...props} />}
            {fileViewItem.fileViewType === 'Empty' && <MonacoView style={isFullscreen ? newStyle : {width, height: height - LIST_HEAD_SIZE}} {...props} />}
            {fileViewItem.fileViewType === 'Img' && <ImageView style={isFullscreen ? newStyle : {width, height: height - LIST_HEAD_SIZE}} {...props} />}
            {fileViewItem.fileViewType === 'Embed' && <EmbedView style={isFullscreen ? newStyle : {width, height: height - LIST_HEAD_SIZE}} {...props} />}
            {fileViewItem.fileViewType === 'Md' && <MdView style={isFullscreen ? newStyle : {width, height: height - LIST_HEAD_SIZE}} {...props} />}
            {fileViewItem.fileViewType === 'Excalidraw' && <ExcalidrawView style={isFullscreen ? newStyle : {width, height: height - LIST_HEAD_SIZE}} {...props} />}
            {fileViewItem.fileViewType === 'Audio' && <AudioView style={isFullscreen ? newStyle : {width, height: height - LIST_HEAD_SIZE}} {...props} />}
            {fileViewItem.fileViewType === 'Video' && <VideoView style={isFullscreen ? newStyle : {width, height: height - LIST_HEAD_SIZE}} {...props} />}
            {fileViewItem.fileViewType === 'Monaco' && <MonacoView style={isFullscreen ? newStyle : {width, height: height - LIST_HEAD_SIZE}} {...props} />}
          </>
        )}}
      </AutoSizer>
    </div>
  )
}

export default FileView;

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
import AutoSizer from "react-virtualized-auto-sizer";
import {FileViewType, getFileTypeGroup} from "@/components/content.ts";
import {LIST_HEAD_SIZE} from "@/components/tree/tree.ts";
import ExcalidrawView from "@/components/file_views/ExcalidrawView.tsx";
import {getAllWindows} from "@tauri-apps/api/window";

function FileView() {
  const fileViewTypeMap = useFileViewTypeMapStore((state) => state.fileViewTypeMap)
  const [fileViewType, setFileViewType] = useState<FileViewType | undefined>(undefined)
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newStyle, setNewStyle] = useState<React.CSSProperties | undefined>({});

  const SwitchView = (() => {
    switch (fileViewType) {
      case 'Empty': return MonacoView;
      case 'Img': return ImageView;
      case 'Embed': return EmbedView;
      case 'Md': return MdView;
      case 'Excalidraw': return ExcalidrawView;
      case 'Audio': return AudioView;
      case 'Video': return VideoView;
      case 'Monaco': return MonacoView;
      default: return NoneView;
    }
  })();

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
  }, [selectedItem, isFullscreen])

  useEffect(() => {
    const fileViewTypeGroup = getFileTypeGroup(selectedItem)
    const selectedFileViewType = fileViewTypeMap[fileViewTypeGroup]
    setFileViewType(selectedFileViewType)
  }, [selectedItem, fileViewTypeMap, fileViewType]);

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
  return (
    <div className="file-view">
      <AutoSizer>
        {({ height, width }) => (
          <SwitchView
            style={isFullscreen ? newStyle : {width, height: height - LIST_HEAD_SIZE}}
            selectedItem={selectedItem}
            fullscreenHandler={fullscreenHandler}
          />
        )}
      </AutoSizer>
    </div>
  )
}

export default FileView;

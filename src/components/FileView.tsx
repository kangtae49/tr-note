import "@/components/file.css"
import {useFileViewTypeMapStore} from "@/stores/fileViewTypeMapStore.ts";
import {useEffect, useState} from "react";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import EmptyView from "@/components/file_views/EmptyView.tsx";
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

function FileView() {
  const fileViewTypeMap = useFileViewTypeMapStore((state) => state.fileViewTypeMap)
  const [fileViewType, setFileViewType] = useState<FileViewType | undefined>(undefined)
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)

  useEffect(() => {
    const fileViewTypeGroup = getFileTypeGroup(selectedItem)
    const selectedFileViewType = fileViewTypeMap[fileViewTypeGroup]
    setFileViewType(selectedFileViewType)
  }, [selectedItem, fileViewTypeMap, fileViewType]);

  const SwitchView = (() => {
    switch (fileViewType) {
      case 'Empty': return MonacoView;
      case 'Img': return ImageView;
      case 'Embed': return EmbedView;
      case 'Md': return MdView;
      case 'Audio': return AudioView;
      case 'Video': return VideoView;
      case 'Monaco': return MonacoView;
      default: return NoneView;
    }
  })();

  return (
    <div className="file-view">
      <AutoSizer>
        {({ height, width }) => (
          <SwitchView style={{width, height: height - LIST_HEAD_SIZE}}/>
        )}
      </AutoSizer>
    </div>
  )
}

export default FileView;

import "@/components/file.css"
import {useFileViewTypeMapStore} from "@/stores/fileViewTypeMapStore.ts";
import {useEffect, useState} from "react";
import {FileViewType} from "@/components/tree/tree.ts";
import {getFileTypeGroup} from "@/components/utils.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import EmptyView from "@/components/file_views/EmptyView.tsx";
import ImageView from "@/components/file_views/ImageView.tsx";
import EmbedView from "@/components/file_views/EmbedView.tsx";
import MdView from "@/components/file_views/MdView.tsx";
import AudioView from "@/components/file_views/AudioView.tsx";
import VideoView from "@/components/file_views/VideoView.tsx";
import MonacoView from "@/components/file_views/MonacoView.tsx";
import NoneView from "@/components/file_views/NoneView.tsx";

function FileView() {
  const fileViewTypeMap = useFileViewTypeMapStore((state) => state.fileViewTypeMap)
  const [fileViewType, setFileViewType] = useState<FileViewType | undefined>(undefined)
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)

  useEffect(() => {
    console.log("FileView useEffect", fileViewType)
    const fileViewTypeGroup = getFileTypeGroup(selectedItem)
    const selectedFileViewType = fileViewTypeMap[fileViewTypeGroup]
    setFileViewType(selectedFileViewType)
  }, [selectedItem, fileViewTypeMap, fileViewType]);

  return (
    <div className="file-view">
      {(() => {
        switch (fileViewType) {
          case 'Empty':
            return <EmptyView />
          case 'Img':
            return <ImageView />
          case 'Embed':
            return <EmbedView />
          case 'Md':
            return <MdView />
          // return <ViewIframe selectedItem={selectedItem} />
          // case 'Iframe':
          //   return <ViewIframe selectedItem={selectedItem} />
          // case 'Text':
          //   return <ViewText selectedItem={selectedItem} />
          case 'Audio':
            return <AudioView />
          case 'Video':
            return <VideoView />
          case 'Monaco':
            return <MonacoView />
          default:
            return <NoneView />
        }
      })()}
    </div>
  )
}

export default FileView;

import {DirectoryViewType} from "@/components/tree/tree.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useDirectoryViewTypeStore} from "@/stores/directoryViewTypeStore.ts";
import FileView from "@/components/FileView.tsx";
import DirectoryView from "@/components/DirectoryView.tsx";
import GalleryView from "@/components/GalleryView.tsx";
import DirectoryHeadView from "@/components/DirectoryHeadView.tsx";
import FileHeadView from "@/components/FileHeadView.tsx";
import ContentHeadView from "@/components/ContentHeadView.tsx";

type ContentType = 'FileViewType' | DirectoryViewType
function ContentView() {
  let contentType: ContentType = 'FileViewType'
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const directoryViewTypeStore = useDirectoryViewTypeStore((state) => state.directoryViewType)
  if (!selectedItem?.dir) {
    contentType = 'FileViewType'
  } else if (selectedItem?.dir) {
    contentType = directoryViewTypeStore
  }
  if (selectedItem == undefined) return null;
  return (
    <div className="content-view">
      <ContentHeadView />
      {selectedItem?.dir ? (
        <DirectoryHeadView />
      ):(
        <FileHeadView />
      )}
      {contentType == 'FileViewType' && (<FileView />)}
      {contentType == 'DirectoryViewType' && (<DirectoryView />)}
      {contentType == 'GalleryViewType' && (<GalleryView />)}
    </div>
  )
}

export default ContentView;

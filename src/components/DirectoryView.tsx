import {useEffect} from "react";
import "@/components/directory.css"
import {fetchTreeItems, LIST_HEAD_SIZE, LIST_ITEM_SIZE} from "@/components/tree/tree.ts";
import { FixedSizeList as List } from 'react-window'
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useFolderListOrderStore} from "@/stores/folderListOrderStore.ts";
import {useFolderListStore} from "@/stores/folderListStore.ts";
import DirectoryHeadView from "@/components/DirectoryHeadView.tsx";
import AutoSizer from "react-virtualized-auto-sizer";
import DirectoryItemView from "@/components/DirectoryItemView.tsx";

function DirectoryView() {
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const folderListOrder = useFolderListOrderStore((state) => state.folderListOrder)
  const folderList = useFolderListStore((state) => state.folderList)
  const setFolderList = useFolderListStore((state) => state.setFolderList)

  useEffect(() => {
    fetchTreeItems({ treeItem: selectedItem, appendChildItems: false, folderListOrder }).then(
      (fetchItems) => setFolderList(fetchItems)
    )
  }, [folderListOrder, selectedItem, setFolderList])
  if (folderList == undefined) return null;
  return (
    <div className="directory-view">
      <AutoSizer>
        {({ height, width }) => (
          <List
            className="folder-list"
            height={height - LIST_HEAD_SIZE}
            itemCount={folderList?.length || 0}
            itemSize={LIST_ITEM_SIZE}
            width={width}
          >
            {({ index, style }) => {
              const listItem = folderList[index]
              return listItem ? (
                <DirectoryItemView
                  key={index}
                  style={style}
                  treeItem={listItem}
                />
              ) : null
            }}
          </List>
        )}
      </AutoSizer>
    </div>
  )
}

export default DirectoryView;

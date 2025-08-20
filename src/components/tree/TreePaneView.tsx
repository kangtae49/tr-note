import {useEffect, useRef, useState} from "react";
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import TreeItemView from "@/components/tree/TreeItemView.tsx";
import TreeHeadView from "@/components/tree/TreeHeadView.tsx";
import {useFolderTreeStore} from "@/components/tree/stores/folderTreeStore.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useFolderTreeRefStore} from "@/components/tree/stores/folderTreeRefStore.ts";
import {
  fetchDisks,
  FolderTree,
  getCountOfTreeItems,
  getNthOfTreeItems,
  scrollToItem,
  TREE_ITEM_SIZE
} from "@/components/tree/tree.ts";

function TreePaneView() {
  const folderTree = useFolderTreeStore((state) => state.folderTree)
  const setFolderTree = useFolderTreeStore((state) => state.setFolderTree)
  const setSelectedItem = useSelectedTreeItemStore((state) => state.setSelectedItem)
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const setFolderTreeRef = useFolderTreeRefStore((state) => state.setFolderTreeRef)
  const folderTreeRef = useFolderTreeRefStore((state) => state.folderTreeRef)

  const listRef = useRef<List>(null)

  useEffect(() => {
    setFolderTreeRef(listRef)
  }, [setFolderTreeRef])

  useEffect(() => {
    fetchDisks().then((folderTree: FolderTree | undefined) => {
      if (folderTree) {
        setFolderTree([...folderTree])
      } else {
        setFolderTree(undefined)
      }
    })
  }, [folderTreeRef, setFolderTree, setSelectedItem])

  useEffect(() => {
    if (selectedItem) {
      scrollToItem({ selectedItem, folderTree, folderTreeRef }).then()
    }
  }, [selectedItem]);

  return (
    <div className="tree-pane">
      <TreeHeadView />
      <div className="tree-body">
        <AutoSizer>
          {({ height, width }) => (
            <List
              className="folder-tree"
              height={height}
              itemCount={getCountOfTreeItems(folderTree) || 0}
              itemSize={TREE_ITEM_SIZE}
              width={width}
              ref={listRef}
            >
              {({ index, style }) => {
                const treeItem = getNthOfTreeItems(folderTree, index)[0]
                return treeItem ? (
                  <TreeItemView key={index} style={style} treeItem={treeItem} />
                ) : null
              }}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  )
}

export default TreePaneView;

import React, {useCallback, useEffect, useRef} from "react";
import "./tree.css";
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
  getCountOfTreeItems, getNth,
  getNthOfTreeItems,
  scrollToItem, toggleDirectory,
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

  const keyDownHandler = useCallback(async (e: React.KeyboardEvent): Promise<void> => {
    console.log('keyDownHandler', e.key)
    if (!selectedItem) {
      return
    }
    const [, nth] = getNth(folderTree, selectedItem)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const [newTreeItem] = getNthOfTreeItems(folderTree, nth + 1)
      if (newTreeItem) {
        setSelectedItem(newTreeItem)
        await scrollToItem({ folderTree, selectedItem: newTreeItem, folderTreeRef })
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const [newTreeItem] = getNthOfTreeItems(folderTree, nth - 1)
      if (newTreeItem) {
        setSelectedItem(newTreeItem)
        await scrollToItem({ folderTree, selectedItem: newTreeItem, folderTreeRef })
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      if (selectedItem.parent) {
        setSelectedItem(selectedItem.parent)
        await scrollToItem({ folderTree, selectedItem: selectedItem.parent, folderTreeRef })
      }
    } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
      e.preventDefault()
      if (folderTree && selectedItem.dir) {
        await toggleDirectory({ treeItem: selectedItem })
        setFolderTree([...folderTree])
      }
    }
  }, [selectedItem, folderTree]);

  // useEffect(() => {
  //   if (divRef.current == undefined) return;
  //   divRef.current.addEventListener("keydown", keyDownHandler, { capture: true });
  //   return () => {
  //     divRef.current?.removeEventListener("keydown", keyDownHandler, { capture: true });
  //   };
  // }, [divRef, folderTree, selectedItem])

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



  return (
    <div className="tree-pane" tabIndex={0} onKeyDownCapture={keyDownHandler}>
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

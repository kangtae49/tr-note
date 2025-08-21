import React, {useCallback, useEffect, useState} from "react";
import {commands} from "@/bindings.ts";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faFolderPlus, faFile } from '@fortawesome/free-solid-svg-icons'
import {getNthParent, toggleDirectory, TreeItem} from "@/components/tree/tree.ts";
import {useFolderTreeStore} from "@/components/tree/stores/folderTreeStore.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";

const SEP = "\\";
const TREE_DEPT_SIZE = 13;

type Prop = {
  style: React.CSSProperties
  treeItem: TreeItem
}

function TreeItemView({treeItem, style}: Prop) {
  const folderTree = useFolderTreeStore((state) => state.folderTree)
  const setFolderTree = useFolderTreeStore((state) => state.setFolderTree)
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const setSelectedItem = useSelectedTreeItemStore((state) => state.setSelectedItem)

  const clickIcon = async (treeItem?: TreeItem): Promise<void> => {
    console.log('click', treeItem)
    if (folderTree && treeItem) {
      if (treeItem?.dir) {
        await toggleDirectory({ treeItem })
        setFolderTree([...folderTree])
      } else {
        await clickLabel(treeItem)
      }
      setSelectedItem({...treeItem})
    }
  }

  const clickLabel = async (newTreeItem: TreeItem | undefined) => {
    console.log('clickLabel', newTreeItem)
    if (folderTree == undefined) return;
    if (newTreeItem == undefined) return;
    if (newTreeItem.dir) {
      console.log('toggleDirectory', newTreeItem)
      await toggleDirectory({ treeItem: newTreeItem })
      setFolderTree([...folderTree]);
    }
    setSelectedItem({...newTreeItem})
  }

  let fullPath = treeItem.full_path
  if (fullPath.endsWith(`:${SEP}`)) {
    fullPath = fullPath.split(SEP).join("")
  }
  const arr = fullPath.split(SEP)
  const pathList = arr.slice(0, -1).map((_nm, idx) => {
    return arr.slice(0, idx + 1).join(SEP)
  })
  const iconWidth = 18
  const nm_minus = TREE_DEPT_SIZE * pathList.length + iconWidth
  const classNameSelected = treeItem.full_path == selectedItem?.full_path ? 'selected' : ''
  const icon_style = { flex: `0 0 ${iconWidth}px` }
  const nm_style = {
    width: `calc(100% - ${nm_minus}px)`
  }
  return (
    <div className={`tree-item ${classNameSelected}`} style={style}>
      {pathList.map((path, idx) => {
        const color = idx % 2 === 0 ? '#c8ada4' : '#6a99b8'
        const parentTreeItem = getNthParent(treeItem, pathList.length - idx)
        return (
          <div
            className="depth"
            key={idx}
            title={path}
            onClick={() => clickIcon(parentTreeItem)}
          >
            <svg width="100%" height="100%">
              <line x1="5" y1="0" x2="5" y2="100%" stroke={color} strokeWidth="2" />
            </svg>
          </div>
        )
      })}
      <div className="nm" style={nm_style}>
        <div className="icon" style={icon_style} onClick={() => clickIcon(treeItem)}>
          <Icon icon={treeItem.dir ? faFolderPlus : faFile} />
        </div>
        <div
          className="label"
          title={treeItem.full_path}
          // style={nm_label_style}
          onClick={() => clickLabel(treeItem)}
        >
          {treeItem.nm}
        </div>
      </div>
    </div>
  )
}

export default React.memo(TreeItemView);

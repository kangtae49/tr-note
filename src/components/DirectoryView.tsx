import React, {useEffect} from "react";
import "@/components/directory.css"
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {faFile, faFolder, faFileImage} from "@fortawesome/free-solid-svg-icons";
import {fetchTreeItems, LIST_HEAD_SIZE, LIST_ITEM_SIZE, renderTreeFromPath} from "@/components/tree/tree.ts";
import { FixedSizeList as List } from 'react-window'
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useFolderListOrderStore} from "@/stores/folderListOrderStore.ts";
import {useFolderListStore} from "@/stores/folderListStore.ts";
import AutoSizer from "react-virtualized-auto-sizer";
import DirectoryItemView from "@/components/DirectoryItemView.tsx";
import * as ContextMenu from "@radix-ui/react-context-menu";

import "@/components/contextmenu.css";
import {useFolderTreeStore} from "@/components/tree/stores/folderTreeStore.ts";
import {useFolderTreeRefStore} from "@/components/tree/stores/folderTreeRefStore.ts";
import {commands} from "@/bindings.ts";
import toast from "react-hot-toast";

function DirectoryView() {
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const setSelectedItem = useSelectedTreeItemStore((state) => state.setSelectedItem)
  const folderListOrder = useFolderListOrderStore((state) => state.folderListOrder)
  const folderList = useFolderListStore((state) => state.folderList)
  const setFolderList = useFolderListStore((state) => state.setFolderList)
  const folderTree = useFolderTreeStore((state) => state.folderTree)
  const setFolderTree = useFolderTreeStore((state) => state.setFolderTree)
  const folderTreeRef = useFolderTreeRefStore((state) => state.folderTreeRef)

  const clickCreateFile = () => {
    if (selectedItem == undefined) return;
    commands.createFile(selectedItem.full_path).then(async (res) => {
      if(res.status === 'ok') {
        await renderTreeFromPath({
          fullPath: selectedItem.full_path,
          folderTree,
          setFolderTree,
          folderTreeRef,
          setSelectedItem,
          selectedItem
        })
        toast.success(`success ${res.data}`);
      } else {
        toast.error(`fail ${res.error}`);
      }
    }).catch((err) => {
      toast.error(`fail ${err}`);
    });
  }

  const clickCreateFolder = () => {
    if (selectedItem == undefined) return;
    commands.createFolder(selectedItem.full_path).then(async (res) => {
      if(res.status === 'ok') {
        console.log('create folder ok', res.data);
        await renderTreeFromPath({
          fullPath: selectedItem.full_path,
          folderTree,
          setFolderTree,
          folderTreeRef,
          setSelectedItem,
          selectedItem
        })
        toast.success(`success ${res.data}`);

      } else {
        toast.error(`fail ${res.error}`);
      }
    }).catch((err) => {
      toast.error(`fail ${err}`);
    });
  }

  const clickCreateDrawFile = () => {
    if (selectedItem == undefined) return;
    commands.createDrawFile(selectedItem.full_path).then(async (res) => {
      if(res.status === 'ok') {
        await renderTreeFromPath({
          fullPath: selectedItem.full_path,
          folderTree,
          setFolderTree,
          folderTreeRef,
          setSelectedItem,
          selectedItem
        })
        toast.success(`success ${res.data}`);
      } else {
        toast.error(`fail ${res.error}`);
      }
    }).catch((err) => {
      toast.error(`fail ${err}`);
    });
  }


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
          <ContextMenu.Root>
            <ContextMenu.Trigger>
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
                      clickCreateFile={clickCreateFile}
                      clickCreateFolder={clickCreateFolder}
                      clickCreateDrawFile={clickCreateDrawFile}
                    />
                  ) : null
                }}
              </List>
            </ContextMenu.Trigger>
            <ContextMenu.Portal>
              <ContextMenu.Content className="context-menu">
                <ContextMenu.Item className="context-menu-item" onSelect={clickCreateFolder}>
                  <Icon icon={faFolder}/> Create Folder
                </ContextMenu.Item>
                <ContextMenu.Item className="context-menu-item" onSelect={clickCreateFile}>
                  <Icon icon={faFile}/> Create File
                </ContextMenu.Item>
                <ContextMenu.Item className="context-menu-item" onSelect={clickCreateDrawFile}>
                  <Icon icon={faFileImage}/> Create Draw File
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Portal>

          </ContextMenu.Root>
        )}
      </AutoSizer>
    </div>
  )
}

export default DirectoryView;

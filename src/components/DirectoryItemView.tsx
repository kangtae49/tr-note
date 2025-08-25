import React, {useCallback, useEffect, useRef, useState} from "react";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {faFile, faFolder, faRocket, faFileImage} from "@fortawesome/free-solid-svg-icons";
import {renderTreeFromPath, TreeItem} from "@/components/tree/tree.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useFolderListVisibleColsStore} from "@/stores/folderListVisibleColsStore.ts";
import {formatFileSize, toDate} from "@/components/utils.ts";
import * as utils from "@/components/utils.ts";
import * as ContextMenu from "@radix-ui/react-context-menu";
import {commands} from "@/bindings.ts";
import {useFolderTreeStore} from "@/components/tree/stores/folderTreeStore.ts";
import {useFolderTreeRefStore} from "@/components/tree/stores/folderTreeRefStore.ts";
import toast from "react-hot-toast";

interface Props {
  style: React.CSSProperties
  treeItem: TreeItem
  clickCreateFolder: () => void
  clickCreateFile: () => void
  clickCreateDrawFile: () => void
}
function DirectoryItemView({ treeItem, style, clickCreateFolder, clickCreateFile, clickCreateDrawFile }: Props) {
  const setSelectedItem = useSelectedTreeItemStore((state) => state.setSelectedItem)
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const folderTree = useFolderTreeStore((state) => state.folderTree)
  const setFolderTree = useFolderTreeStore((state) => state.setFolderTree)
  const folderTreeRef = useFolderTreeRefStore((state) => state.folderTreeRef)
  const folderListVisibleCols = useFolderListVisibleColsStore(
    (state) => state.folderListVisibleCols
  )
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = React.useState(treeItem.nm);

  const clickRename = useCallback(() => {
    setTempName(treeItem.nm);
    setEditing(true);
  }, [inputRef])

  const clickDelete = () => {
    if (selectedItem == undefined) return;

    console.log('todo: delete', treeItem.full_path);
    commands.deletePath(treeItem.full_path).then(async (res) => {
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
  };


  const onBlur = useCallback(() => {
    console.log('onBlur', tempName);
    if (selectedItem == undefined) return;

    setEditing(false);
    if (tempName !== treeItem.nm) {
      commands.renamePath(selectedItem.full_path, treeItem.nm, tempName).then(async (res) => {
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
  }, [tempName]);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setTempName(treeItem.nm);
      e.currentTarget.blur();
    }

    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  useEffect(() => {
    if (editing) {
      setTimeout(()=>{inputRef.current?.focus()}, 0);
      console.log('focus input');
    }
  }, [editing]);

  const fullPath = treeItem.full_path
  const nm = treeItem.nm
  const sz = formatFileSize(treeItem.sz)
  const ext = treeItem.dir ? '' : treeItem.ext?.slice(-10) || ''
  const tm = toDate(treeItem.tm)



  return (
    <div className="directory-item-view" style={style}>
      <div className="nm">
        <div className="icon">
          <Icon icon={faRocket} onClick={() => utils.shellOpenPath(fullPath)} />
        </div>
        <div className="icon" onClick={() => utils.shellShowItemInFolder(fullPath)}>
          <Icon icon={treeItem.dir ? faFolder : faFile} />
        </div>
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            {editing ? (
              <div className="label">
                <input ref={inputRef} type="text" value={tempName}
                       onChange={(e) => setTempName(e.target.value)}
                       onKeyDown={handleKeyDown}
                       onBlur={onBlur}
                />
              </div>
            ):(
              <div className="label" title={fullPath}
                   onDoubleClick={() => setSelectedItem(treeItem)}>
                {nm}
              </div>
            )}
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content className="context-menu">
              <ContextMenu.Item className="context-menu-item" onSelect={clickRename}>
                <Icon icon={treeItem.dir ? faFolder : faFile}/> Rename
              </ContextMenu.Item>
              <ContextMenu.Item className="context-menu-item" onSelect={clickDelete}>
                <Icon icon={treeItem.dir ? faFolder : faFile}/> Delete
              </ContextMenu.Item>
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
      </div>
      {folderListVisibleCols.includes('Sz') && <div className="sz" title={`${treeItem.sz || 0}`}>{sz}</div>}
      {folderListVisibleCols.includes('Ext') && <div className="ext" title={treeItem?.ext || ''}>{ext}</div>}
      {folderListVisibleCols.includes('Tm') && <div className="tm">{tm}</div>}
    </div>
  )
}

export default DirectoryItemView;

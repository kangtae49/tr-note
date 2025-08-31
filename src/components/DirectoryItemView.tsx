import React, {RefObject, useCallback, useEffect, useRef, useState} from "react";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {faFile, faFolder, faRocket, faFileImage, faFileInvoice} from "@fortawesome/free-solid-svg-icons";
import {useRenderTreeFromPath, TreeItem} from "@/components/tree/tree.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useFolderListVisibleColsStore} from "@/stores/folderListVisibleColsStore.ts";
import {formatFileSize, toDate} from "@/components/utils.ts";
import * as utils from "@/components/utils.ts";
import * as ContextMenu from "@radix-ui/react-context-menu";
import * as Tooltip from "@radix-ui/react-tooltip";
import {commands, TabItem} from "@/bindings.ts";
import toast from "react-hot-toast";
import {useTab} from "@/components/tab/stores/tabItemsStore.ts";
import {useFileContent} from "@/stores/contentsStore.ts";
import {useFileSavedContent} from "@/stores/savedContentsStore.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useCreatePathStore} from "@/stores/createPathStore.ts";
import {useRecentPathStore} from "@/stores/recentPathStore.ts";

interface Props {
  style: React.CSSProperties
  treeItem: TreeItem
  boundaryRef: RefObject<HTMLDivElement | null>;
  clickCreateFolder: () => void
  clickCreateFile: (ext: string) => void
}
function DirectoryItemView({ treeItem, style, boundaryRef, clickCreateFolder, clickCreateFile }: Props) {
  const {selectedItem, setSelectedItem} = useSelectedTreeItemStore()
  const {folderListVisibleCols} = useFolderListVisibleColsStore()
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = React.useState(treeItem.nm);
  const {removeTab} = useTab();
  const {removeContent} = useFileContent(treeItem.full_path);
  const {removeSavedContent} = useFileSavedContent(treeItem.full_path)
  const http = useHttp();
  const {renderTreeFromPath} = useRenderTreeFromPath();
  const {createPath, setCreatePath} = useCreatePathStore();
  const {recentPath, setRecentPath} = useRecentPathStore()

  const clickRename = useCallback(() => {
    setTempName(treeItem.nm);
    setEditing(true);
  }, [inputRef])

  const clickDelete = () => {
    if (selectedItem == undefined) return;

    console.log('todo: delete', treeItem.full_path);
    commands.deletePath(treeItem.full_path).then(async (res) => {
      if(res.status === 'ok') {
        removeTab(treeItem as TabItem)
        removeContent();
        removeSavedContent();
        await renderTreeFromPath(selectedItem.full_path)
        toast.success(`success ${res.data}`);
      } else {
        toast.error(`fail ${Object.values(res.error)[0]}`);
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
          removeTab(treeItem as TabItem)
          await renderTreeFromPath(selectedItem.full_path)
          if (recentPath === selectedItem.full_path) {
            setRecentPath(undefined);
          }
          toast.success(`success ${res.data}`);

        } else {
          toast.error(`fail ${Object.values(res.error)[0]}`);
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
    <Tooltip.Root>
    <div className={`directory-item-view ${recentPath === fullPath ? "created" : ""}`} style={style}>
      <div className="nm">
        <div className="icon">
          <Icon icon={faRocket} onClick={() => utils.shellOpenPath(fullPath)} />
        </div>
        <div className="icon" onClick={() => utils.shellShowItemInFolder(fullPath)}>
          <Icon icon={treeItem.dir ? faFolder : faFile} />
        </div>
          <ContextMenu.Root>

            <Tooltip.Trigger asChild>
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
                <div className="label"
                     onDoubleClick={() => setSelectedItem(treeItem)}>
                  {nm}
                </div>
              )}
            </ContextMenu.Trigger>
            </Tooltip.Trigger>
            { (http !== undefined && treeItem.mt?.startsWith('image/')) && (
              <Tooltip.Content side="right"
                             align="center"
                             sideOffset={0}
                             avoidCollisions={true}
                               collisionPadding={30}
                             collisionBoundary={boundaryRef.current}
                             className="tooltip-content">
                <div className="tooltip-image">
                  <img src={http.getSrc(treeItem.full_path)} />
                </div>
              </Tooltip.Content>
            )}

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
                <ContextMenu.Item className="context-menu-item" onSelect={() => clickCreateFile("txt")}>
                  <Icon icon={faFile}/> Create File
                </ContextMenu.Item>
                <ContextMenu.Item className="context-menu-item" onSelect={() => clickCreateFile("excalidraw")}>
                  <Icon icon={faFileImage}/> Create Draw File
                </ContextMenu.Item>
                <ContextMenu.Item className="context-menu-item" onSelect={() => clickCreateFile("md")}>
                  <Icon icon={faFileInvoice}/> Create Markdown File
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Portal>

          </ContextMenu.Root>
      </div>
      {folderListVisibleCols.includes('Sz') && <div className="sz" title={`${treeItem.sz || 0}`}>{sz}</div>}
      {folderListVisibleCols.includes('Ext') && <div className="ext" title={treeItem?.ext || ''}>{ext}</div>}
      {folderListVisibleCols.includes('Tm') && <div className="tm">{tm}</div>}
    </div>
    </Tooltip.Root>
  )
}

export default DirectoryItemView;

import React from "react";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {faFile, faFolder, faRocket} from "@fortawesome/free-solid-svg-icons";
import {TreeItem} from "@/components/tree/tree.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useFolderListVisibleColsStore} from "@/stores/folderListVisibleColsStore.ts";
import {formatFileSize, toDate} from "@/components/utils.ts";
import * as utils from "@/components/utils.ts";

interface Props {
  style: React.CSSProperties
  treeItem: TreeItem
}
function DirectoryItemView({ treeItem, style }: Props) {
  const setSelectedItem = useSelectedTreeItemStore((state) => state.setSelectedItem)
  const folderListVisibleCols = useFolderListVisibleColsStore(
    (state) => state.folderListVisibleCols
  )
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
        <div className="label" title={fullPath} onClick={() => setSelectedItem(treeItem)}>
          {nm}
        </div>
      </div>
      {folderListVisibleCols.includes('Sz') && <div className="sz" title={`${treeItem.sz || 0}`}>{sz}</div>}
      {folderListVisibleCols.includes('Ext') && <div className="ext" title={treeItem?.ext || ''}>{ext}</div>}
      {folderListVisibleCols.includes('Tm') && <div className="tm">{tm}</div>}
    </div>
  )
}

export default DirectoryItemView;

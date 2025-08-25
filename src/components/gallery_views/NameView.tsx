import React, {memo} from "react";
import {TreeItem} from "@/components/tree/tree.ts";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {faFile, faFolder, faRocket} from "@fortawesome/free-solid-svg-icons";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useFolderListVisibleColsStore} from "@/stores/folderListVisibleColsStore.ts";
import {formatFileSize, toDate} from "@/components/utils.ts";
import * as utils from "@/components/utils.ts";

interface Props {
  item?: TreeItem
  sliderPos: { x: number; y: number }
}

function NameView({ item, sliderPos }: Props) {
  const setSelectedItem = useSelectedTreeItemStore((state) => state.setSelectedItem)
  const folderListVisibleCols = useFolderListVisibleColsStore(
    (state) => state.folderListVisibleCols
  )
  const fullPath = item?.full_path
  const nm = item?.nm
  const sz = formatFileSize(item?.sz)
  const ext = item?.dir ? '' : item?.ext?.slice(-10) || ''
  const tm = toDate(item?.tm)

  return (
    <div className="name-view col"
         style={{ width: sliderPos.x, height: sliderPos.y }}
         title={item?.nm}
    >
      <div className="nm">
        <div className="icon">
          <Icon icon={faRocket} onClick={() => utils.shellOpenPath(fullPath)} />
        </div>
        <div className="icon" onClick={() => utils.shellShowItemInFolder(fullPath)}>
          <Icon icon={item?.dir ? faFolder : faFile} />
        </div>
        <div className="label" title={fullPath} onDoubleClick={() => setSelectedItem(item)}>
          {nm}
        </div>
      </div>
      {folderListVisibleCols.includes('Sz') && <div className="sz" title={`${item?.sz || 0}`}>{sz}</div>}
      {folderListVisibleCols.includes('Ext') && <div className="ext" title={item?.ext || ''}>{ext}</div>}
      {folderListVisibleCols.includes('Tm') && <div className="tm">{tm}</div>}
    </div>
  )
}

export default memo(NameView);

import React from "react";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useFileViewTypeMapStore} from "@/stores/fileViewTypeMapStore.ts";
import {formatFileSize, getFileTypeGroup, getFileViewIcon, toDate} from "@/components/utils.ts";
import {fileViewTypeGroupMap} from "@/components/tree/tree.ts";

function FileHeadView(): React.ReactElement {
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const fileViewTypeMap = useFileViewTypeMapStore((state) => state.fileViewTypeMap)
  const setFileViewTypeMap = useFileViewTypeMapStore((state) => state.setFileViewTypeMap)

  const fileViewTypeGroup = getFileTypeGroup(selectedItem)
  const sz = selectedItem?.sz || 0
  const fileViewTypeList = fileViewTypeGroupMap[fileViewTypeGroup]
  const selectedFileViewType = fileViewTypeMap[fileViewTypeGroup]

  const clickFileViewType = (viewType: string) => {
    setFileViewTypeMap({
      ...fileViewTypeMap,
      [fileViewTypeGroup]: viewType
    })
  }

  return (
    <div className="file-head-view">
      {!selectedItem?.dir && (
        <div className="file-types">
          {
            fileViewTypeList.map((fileViewType, idx) => {
              return (
                <Icon
                  key={idx}
                  className={fileViewType == selectedFileViewType ? 'selected' : ''}
                  icon={getFileViewIcon(fileViewType)}
                  onClick={() => clickFileViewType(fileViewType)}
                />
              )
            })
          }
        </div>
      )}
      <div className="info">
        <div className="nm">{selectedItem?.nm}</div>
        <div className="sz" title={`${sz}`}>{formatFileSize(sz)}</div>
        <div className="tm">{toDate(selectedItem?.tm)}</div>
      </div>

    </div>
  )
}

export default FileHeadView

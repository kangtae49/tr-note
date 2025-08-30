import React, {useEffect, useState} from "react";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useFileViewTypeMapStore} from "@/stores/fileViewTypeMapStore.ts";
import {formatFileSize, toDate} from "@/components/utils.ts";
import {
  FileViewType,
  fileViewTypeGroupMap, getFileItem,
  getFileViewIcon, getFileViewInfo
} from "@/components/content.ts";
import {useFileViewTypeStore} from "@/stores/fileViewTypeStore.ts";
import {useFileViewTypeGroupStore} from "@/stores/fileViewTypeGroupStore.ts";
import {useFileViewItemStore} from "@/stores/fileViewItemStore.ts";

function FileHeadView(): React.ReactElement {
  const {selectedItem} = useSelectedTreeItemStore()
  const {fileViewTypeMap, setFileViewTypeMap} = useFileViewTypeMapStore()
  const {fileViewType, setFileViewType} = useFileViewTypeStore()
  const {fileViewTypeGroup, setFileViewTypeGroup} = useFileViewTypeGroupStore();
  const {setFileViewItem} = useFileViewItemStore()
  const [fileViewTypeList, setFileViewTypeList] = useState<FileViewType[]>([]);

  const [sz, setSz] = useState(0);
  const [fileItem, setFileItem] = useState<any>();

  const clickFileViewType = (viewType: FileViewType) => {
    if (fileViewTypeGroup == undefined) return;
    fileViewTypeMap[fileViewTypeGroup] = viewType;
    setFileViewTypeMap({...fileViewTypeMap});
    // setFileViewTypeMap({
    //   ...fileViewTypeMap,
    //   [fileViewTypeGroup]: viewType
    // })

    setFileViewType(viewType);
  }

  useEffect(() => {
    getFileItem(selectedItem).then((fileItem) => {
      setFileItem(fileItem);
    });
  }, [selectedItem])

  useEffect(() => {
    getFileViewInfo(fileItem).then((fileViewTypeGroup) => {
      setFileViewTypeGroup(fileViewTypeGroup);
      const fileViewTypeList = fileViewTypeGroupMap[fileViewTypeGroup]
      setFileViewTypeList(fileViewTypeList);
      const sz = fileItem?.sz || 0;
      setSz(sz);
      const fileViewType = fileViewTypeMap[fileViewTypeGroup]
      setFileViewType(fileViewType);

      if (selectedItem !== undefined && fileItem !== undefined) {
        setFileViewItem({fileViewType, fileItem});
      } else {
        setFileViewItem(undefined);
      }
    }).catch((e) => {
      console.error(e);
      if (selectedItem !== undefined) {
        setFileViewItem({fileViewType: 'Error', fileItem, error: e})
      }
    })

  }, [fileItem, fileViewType])

  return (
    <div className="file-head-view">
      {(fileItem !== undefined && fileItem.dir == false) && (
        <div className="file-types">
          {
            fileViewTypeList.map((viewType, idx) => {
              let inactive = viewType == fileViewType ? '' : 'inactive';
              if (fileViewTypeList.length == 1) {
                inactive = ""
              }
              return (
                <Icon
                  key={idx}
                  className={inactive}
                  icon={getFileViewIcon(viewType)}
                  onClick={() => clickFileViewType(viewType)}
                />
              )
            })
          }
        </div>
      )}
      <div className="info">
        <div className="nm">{fileItem?.nm}</div>
        <div className="sz" title={`${sz}`}>{formatFileSize(sz)}</div>
        <div className="tm">{toDate(fileItem?.tm)}</div>
      </div>

    </div>
  )
}

export default FileHeadView

import React from "react";
import {formatFileSize} from "@/components/utils.ts";
import {FileViewProps} from "@/components/FileView.tsx";


function EmptyView({ style, fileItem, fullscreenHandler }: FileViewProps): React.ReactElement {
  if (fileItem == undefined) {
    return <div className='empty-view' style={style}></div>
  }
  return (
    <div className="empty-view" style={style}
         tabIndex={0}
         onKeyDownCapture={fullscreenHandler}>
      <h3>{fileItem?.nm}</h3>
      <h3>{formatFileSize(fileItem?.sz ?? 0)}</h3>
    </div>
  )
}

export default EmptyView;

import React from "react";
import {formatFileSize} from "@/components/utils.ts";
import {FileViewProps} from "@/components/FileView.tsx";


function EmptyView({ style, selectedItem, fullscreenHandler }: FileViewProps): React.ReactElement {
  if (selectedItem == undefined) {
    return <div className='empty-view' style={style}></div>
  }
  return (
    <div className="empty-view" style={style}
         tabIndex={0}
         onKeyDownCapture={fullscreenHandler}>
      <h3>{selectedItem?.nm}</h3>
      <h3>{formatFileSize(selectedItem?.sz)}</h3>
    </div>
  )
}

export default EmptyView;

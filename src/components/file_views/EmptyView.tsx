import React from "react";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {formatFileSize} from "@/components/utils.ts";

interface Props {
  style?: React.CSSProperties
  fullscreenHandler?: (e: any) => Promise<void>
}
function EmptyView({ style, fullscreenHandler }: Props): React.ReactElement {
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const http = useHttp();
  if (selectedItem == undefined || http == undefined) {
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

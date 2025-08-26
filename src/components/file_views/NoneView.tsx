import React from "react";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {formatFileSize} from "@/components/utils.ts";
import {TreeItem} from "@/components/tree/tree.ts";

interface Props {
  style?: React.CSSProperties
  selectedItem?: TreeItem
  fullscreenHandler?: (e: any) => Promise<void>
}

function NoneView({ style, selectedItem, fullscreenHandler }: Props): React.ReactElement {
  const http = useHttp();
  if (selectedItem == undefined || http == undefined) {
    return <div className='none-view'></div>
  }
  return (
    <div className="none-view"
         style={style}
         tabIndex={0}
         onKeyDownCapture={fullscreenHandler}>
      <h3>{selectedItem?.nm}</h3>
      <h3>{formatFileSize(selectedItem?.sz)}</h3>
    </div>
  )
}

export default NoneView;

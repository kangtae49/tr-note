import React from "react";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";

interface Props {
  style?: React.CSSProperties
  fullscreenHandler?: (e: any) => Promise<void>
}

function ImageView({ style, fullscreenHandler }: Props): React.ReactElement {
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const http = useHttp();
  if (selectedItem == undefined || http == undefined) {
    return <div className='image-view'></div>
  }
  return (
    <div className="image-view" style={style} tabIndex={0} onKeyDownCapture={fullscreenHandler}>
      <img src={http.getSrc(selectedItem.full_path)} alt={selectedItem.full_path} />
    </div>
  )
}

export default ImageView;

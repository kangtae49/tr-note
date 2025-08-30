import React from "react";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {FileViewProps} from "@/components/FileView.tsx";


function ImageView({ style, selectedItem, fullscreenHandler }: FileViewProps): React.ReactElement {
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

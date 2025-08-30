import React from "react";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {FileViewProps} from "@/components/FileView.tsx";


function ImageView({ style, fileItem, fullscreenHandler }: FileViewProps): React.ReactElement {
  const http = useHttp();
  if (fileItem == undefined || http == undefined) {
    return <div className='image-view'></div>
  }
  return (
    <div className="image-view" style={style} tabIndex={0} onKeyDownCapture={fullscreenHandler}>
      <img src={http.getSrc(fileItem.full_path)} alt={fileItem.full_path} />
    </div>
  )
}

export default ImageView;

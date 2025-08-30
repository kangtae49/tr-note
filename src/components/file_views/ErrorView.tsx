import React from "react";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {formatFileSize} from "@/components/utils.ts";
import {FileViewProps} from "@/components/FileView.tsx";



function ErrorView({ style, fileItem, fullscreenHandler, error }: FileViewProps): React.ReactElement {
  const http = useHttp();
  if (fileItem == undefined || http == undefined) {
    return <div className='error-view'></div>
  }
  return (
    <div className="error-view"
         style={style}
         tabIndex={0}
         onKeyDownCapture={fullscreenHandler}>
      <h3>{fileItem?.nm}</h3>
      <h3>{formatFileSize(fileItem?.sz ?? 0)}</h3>
      <h3>{`${Object.values(error)[0]}`}</h3>
    </div>
  )
}

export default ErrorView;

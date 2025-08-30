import React from "react";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {FileViewProps} from "@/components/FileView.tsx";



function EmbedView({ style, selectedItem, fullscreenHandler }: FileViewProps): React.ReactElement {
  const http = useHttp();

  if (selectedItem == undefined || http == undefined) {
    return <div className='embed-view'></div>
  }
  return (
    <div className="embed-view"
         style={style}
         tabIndex={0}
         onKeyDownCapture={fullscreenHandler}>
      <embed src={http.getSrc(selectedItem.full_path)} title={selectedItem.full_path}  />
    </div>
  )
}

export default EmbedView;

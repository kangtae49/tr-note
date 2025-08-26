import React, {useEffect, useRef} from "react";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {TreeItem} from "@/components/tree/tree.ts";

interface Props {
  style?: React.CSSProperties
  selectedItem?: TreeItem
  fullscreenHandler?: (e: any) => Promise<void>
}

function EmbedView({ style, selectedItem, fullscreenHandler }: Props): React.ReactElement {
  const http = useHttp();
  // const embedRef = useRef<HTMLEmbedElement | undefined>(undefined);
  //
  // useEffect(() => {
  //   embedRef.current?.requestFullscreen();
  // }, []);

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

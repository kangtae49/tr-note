import React from "react";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";

interface Props {
  style?: React.CSSProperties
}

function EmbedView({ style }: Props): React.ReactElement {
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const http = useHttp();
  if (selectedItem == undefined || http == undefined) {
    return <div className='embed-view'></div>
  }
  return (
    <div className="embed-view" style={style}>
      <embed src={http.getSrc(selectedItem.full_path)} title={selectedItem.full_path} />
    </div>
  )
}

export default EmbedView;

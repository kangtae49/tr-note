import React from "react";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {formatFileSize} from "@/components/utils.ts";

function EmptyView(): React.ReactElement {
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const http = useHttp();
  if (selectedItem == undefined || http == undefined) {
    return <div className='empty-view'></div>
  }
  return (
    <div className="empty-view">
      <h3>{selectedItem?.nm}</h3>
      <h3>{formatFileSize(selectedItem?.sz)}</h3>
    </div>
  )
}

export default EmptyView;

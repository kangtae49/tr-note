import React from "react";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";

function ImageView(): React.ReactElement {
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const http = useHttp();
  if (selectedItem == undefined || http == undefined) {
    return <div className='image-view'></div>
  }
  return (
    <div className="image-view">
      <img src={http.getSrc(selectedItem.full_path)} alt={selectedItem.full_path} />
    </div>
  )
}

export default ImageView;

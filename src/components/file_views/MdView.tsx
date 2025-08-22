import React, {useEffect, useState} from "react";
import MDEditor from '@uiw/react-md-editor';
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";

interface Props {
  style?: React.CSSProperties
}

function MdView({ style }: Props) {
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const [content, setContent] = useState<string | undefined>(undefined);
  const http = useHttp();

  useEffect(() => {
    if (http == undefined) return;
    if (selectedItem == undefined) return;
    http.getSrcText(selectedItem.full_path).then(text => {
      setContent(text);
    });
  }, [selectedItem])

  return (
    <div className="md-view" style={style}>
      <MDEditor
        value={content}
        onChange={setContent}
        preview='live'
        height="100%"
      />
    </div>
  )
}

export default MdView;
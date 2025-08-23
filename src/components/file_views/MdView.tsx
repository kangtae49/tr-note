import React, {useCallback, useEffect, useState} from "react";
import MDEditor from '@uiw/react-md-editor';
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import toast from "react-hot-toast";
import {commands} from "@/bindings.ts";
import {useSaveFile} from "@/components/utils.ts";

interface Props {
  style?: React.CSSProperties
}

function MdView({ style }: Props) {
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const setSelectedItem = useSelectedTreeItemStore((state) => state.setSelectedItem)
  const [content, setContent] = useState<string | undefined>(undefined);
  const http = useHttp();
  const {saveFile} = useSaveFile();

  useEffect(() => {
    if (http == undefined) return;
    if (selectedItem == undefined) return;
    http.getSrcText(selectedItem.full_path).then(text => {
      setContent(text);
    });
  }, [selectedItem])

  const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      if (content == undefined) return;
      if (selectedItem == undefined) return;
      saveFile(content).then((item) => {
        if(selectedItem == undefined) return;
        if (item !== undefined) {
          setSelectedItem({ ...selectedItem, sz: item.sz || 0, tm: item.tm || 0});
        }
        console.log('saveFile done');
      });
    }
  }, [selectedItem, content]);


  return (
    <div className="md-view" style={style} onKeyDown={handleKeyDown}>
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
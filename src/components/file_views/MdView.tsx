import React, {useEffect, useState} from "react";
import MDEditor from '@uiw/react-md-editor';
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";
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


  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
      e.preventDefault();
      console.log('handleKeyDown');
      if (selectedItem == undefined) return;
      if (content == undefined) return;
      saveFile(content).then((item) => {
        if (item !== undefined) {
          setSelectedItem({ ...selectedItem, sz: item.sz || 0, tm: item.tm || 0});
        }
        console.log('saveFile done');
      });
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, content]);

  return (
    <div className="md-view" style={style} >
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
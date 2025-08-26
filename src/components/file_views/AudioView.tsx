import React, {useEffect, useRef} from "react";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {TreeItem} from "@/components/tree/tree.ts";

interface Props {
  style?: React.CSSProperties
  selectedItem?: TreeItem
  fullscreenHandler?: (e: any) => Promise<void>
}

function AudioView({ style, selectedItem, fullscreenHandler }: Props): React.ReactElement {
  const mediaRef = useRef<HTMLAudioElement>(null)
  const http = useHttp();

  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.volume = 0.3
      mediaRef.current?.load()
    }
  }, [])

  if (selectedItem == undefined || http == undefined) {
    return <div className='audio-view'></div>
  }
  return (
    <div className="audio-view" style={style} tabIndex={0} onKeyDownCapture={fullscreenHandler}>
      <audio ref={mediaRef} controls={true} autoPlay={true}>
        <source src={http.getSrc(selectedItem?.full_path)} type={selectedItem?.mt} />
      </audio>
    </div>
  )
}

export default AudioView;

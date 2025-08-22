import React, {useEffect, useRef} from "react";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";

function VideoView(): React.ReactElement {
  const mediaRef = useRef<HTMLVideoElement>(null)
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const http = useHttp();

  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.volume = 0.3
      mediaRef.current?.load()
    }
  }, [])

  if (selectedItem == undefined || http == undefined) {
    return <div className='video-view'></div>
  }
  return (
    <div className="video-view">
      <video ref={mediaRef} controls={true} autoPlay={true}>
        <source src={http.getSrc(selectedItem?.full_path)} type={selectedItem?.mt} />
      </video>
    </div>
  )
}

export default VideoView;

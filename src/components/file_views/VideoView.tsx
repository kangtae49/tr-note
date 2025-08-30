import React, {useEffect, useRef} from "react";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {FileViewProps} from "@/components/FileView.tsx";


function VideoView({ style, selectedItem, fullscreenHandler }: FileViewProps): React.ReactElement {
  const mediaRef = useRef<HTMLVideoElement>(null)
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
    <div className="video-view" style={style} tabIndex={0} onKeyDownCapture={fullscreenHandler}>
      <video ref={mediaRef} controls={true} autoPlay={true}>
        <source src={http.getSrc(selectedItem?.full_path)} type={selectedItem?.mt} />
      </video>
    </div>
  )
}

export default VideoView;

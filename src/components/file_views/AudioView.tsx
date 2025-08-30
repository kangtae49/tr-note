import React, {useEffect, useRef} from "react";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {FileViewProps} from "@/components/FileView.tsx";


function AudioView({ style, fileItem, fullscreenHandler }: FileViewProps): React.ReactElement {
  const mediaRef = useRef<HTMLAudioElement>(null)
  const http = useHttp();

  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.volume = 0.3
      mediaRef.current?.load()
    }
  }, [])

  if (fileItem == undefined || http == undefined) {
    return <div className='audio-view'></div>
  }
  return (
    <div className="audio-view" style={style} tabIndex={0} onKeyDownCapture={fullscreenHandler}>
      <audio ref={mediaRef} controls={true} autoPlay={true}>
        <source src={http.getSrc(fileItem?.full_path)} type={fileItem?.mt ?? ''} />
      </audio>
    </div>
  )
}

export default AudioView;

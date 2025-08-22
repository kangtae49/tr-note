import React, {memo, useEffect, useRef} from "react";
import {TreeItem} from "@/components/tree/tree.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faFile, faFolder, faRocket} from "@fortawesome/free-solid-svg-icons";
import * as utils from "@/components/utils.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";

interface Props {
  item?: TreeItem
  sliderPos: { x: number; y: number }
}

function AudioView({ item, sliderPos }: Props): React.ReactElement {
  const setSelectedItem = useSelectedTreeItemStore((state) => state.setSelectedItem)
  const http = useHttp();
  if (http == undefined || item == undefined) {
    return  <div className="audio-view col"></div>
  }
  const mediaRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.volume = 0.3
      mediaRef.current?.load()
    }
  })
  const fullPath = item?.full_path;
  const nm = item?.nm
  return (
    <div
      className="audio-view col"
      style={{ width: sliderPos.x, height: sliderPos.y }}
      title={item?.nm}
    >
      <div className="nm">
        <div className="icon">
          <Icon icon={faRocket} onClick={() => utils.shellOpenPath(fullPath)} />
        </div>
        <div className="icon" onClick={() => utils.shellShowItemInFolder(fullPath)}>
          <Icon icon={item?.dir ? faFolder : faFile} />
        </div>
        <div className="label" title={fullPath} onClick={() => setSelectedItem(item)}>
          {nm}
        </div>
      </div>
      <div className="audio">
        <audio ref={mediaRef} controls={true} autoPlay={false}>
          <source src={http.getSrc(item?.full_path)} type={item?.mt} />
        </audio>
      </div>
    </div>
  )
}

export default memo(AudioView);

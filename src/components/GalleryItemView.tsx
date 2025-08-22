import {TreeItem} from "@/components/tree/tree.ts";
import React from "react";
import NoneView from "@/components/gallery_views/NoneView.tsx";
import NameView from "@/components/gallery_views/NameView.tsx";
import ImageView from "@/components/gallery_views/ImageView.tsx";


interface Props {
  style: React.CSSProperties
  rowTreeItems: TreeItem[]
  sliderPos: { x: number; y: number }
}

function GalleryItemView ({rowTreeItems, style, sliderPos}: Props) {
  return (
    <div className="gallery-item-view" style={style}>
      {rowTreeItems.map((item, idx) => {
        const sz = item?.sz || 0;
        if(item == undefined) {
          return <NoneView key={idx} item={item} sliderPos={sliderPos} />
        }else if (item.mt?.startsWith('image/')) {
          return <ImageView key={idx} sliderPos={sliderPos} item={item} />
        } else {
          return <NameView key={idx} item={item} sliderPos={sliderPos} />
        }
      })}
    </div>
  )
}

export default GalleryItemView;
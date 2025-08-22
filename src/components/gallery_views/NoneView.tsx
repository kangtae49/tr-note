import {TreeItem} from "@/components/tree/tree.ts";
import {memo} from "react";

interface Props {
  item?: TreeItem
  sliderPos: { x: number; y: number }
}
function NoneView({ item, sliderPos }: Props) {
  console.log(item);
  return (
    <div className="none-view col"
         style={{ width: sliderPos.x, height: sliderPos.y }}>

    </div>
  )
}

export default memo(NoneView);
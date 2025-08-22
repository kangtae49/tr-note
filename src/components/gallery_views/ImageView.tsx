import {TreeItem} from "@/components/tree/tree.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";

interface Props {
  item?: TreeItem
  sliderPos: { x: number; y: number }
}

function ImageView({ item, sliderPos }: Props) {
  const http = useHttp();
  if (http == undefined || item == undefined) {
    return  <div className="image-view col"></div>
  }
  const setSelectedItem = useSelectedTreeItemStore((state) => state.setSelectedItem)
  return (
    <div className="image-view col"
         style={{ width: sliderPos.x, height: sliderPos.y }}
         title={item?.nm}
    >
      <img
        src={http.getSrc(item?.full_path)}
        loading="lazy"
        alt={item?.full_path}
        onClick={() => setSelectedItem(item)}
      />
    </div>
  )
}

export default ImageView;

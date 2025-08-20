import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faFile, faCircleXmark} from "@fortawesome/free-solid-svg-icons";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {TreeItem} from "@/components/tree/tree.ts";

type Props = {
  item: TreeItem
  removeItem: (item: TreeItem) => void
}

function TabItemView({ item, removeItem }: Props) {
  const sortable = useSortable({
    id: item.full_path,
  });
  const mergedProps = {
    ...sortable.attributes,
    ...sortable.listeners,
  };

  const style = {
    transform: CSS.Translate.toString(sortable.transform),
  };

  return (
    <div className="tab-item"
         ref={(node) => {
           sortable.setNodeRef(node);
         }}
         style={style}>
      <div className="tab-icon"
           {...mergedProps}
      >
        <Icon icon={faFile} />
      </div>
      <div className="tab-name"
           {...mergedProps}
           title={item.full_path || ""}
      >
        {item.nm || ""}
      </div>
      <div className="tab-close" onClick={() => removeItem(item)}>
        <Icon icon={faCircleXmark} />
      </div>
    </div>
  )
}

export default TabItemView;

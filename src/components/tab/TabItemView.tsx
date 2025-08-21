import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faUpDownLeftRight, faFile, faFolder, faCircleXmark} from "@fortawesome/free-solid-svg-icons";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {getShortName} from "@/components/tab/tab.ts";
import {TabItem} from "@/components/tab/stores/tabItemsStore.ts";
import {SEP} from "@/components/tree/tree.ts";

type Props = {
  item: TabItem
  removeItem: (item: TabItem) => void
}

function TabItemView({ item, removeItem }: Props) {
  const sortable = useSortable({
    id: item,
  });
  const mergedProps = {
    ...sortable.attributes,
    ...sortable.listeners,
  };

  const style = {
    transform: CSS.Translate.toString(sortable.transform),
  };

  const clickTab = (item: TabItem) => {
    console.log('clickTab', item);

  }

  return (
    <div className="tab-item"
         ref={(node) => {
           sortable.setNodeRef(node);
         }}
         style={style}>
      <div className="tab-icon"
           {...mergedProps}
      >
        <Icon icon={faUpDownLeftRight} />
      </div>
      <div className="tab-icon"
        onClick={()=> clickTab(item)}
      >
        <Icon icon={item.endsWith(SEP) ? faFolder : faFile} />
      </div>
      <div className="tab-name"
           title={item}
           onClick={()=> clickTab(item)}
      >
        {getShortName(item)}
      </div>
      <div className="tab-close" onClick={() => removeItem(item)}>
        <Icon icon={faCircleXmark} />
      </div>
    </div>
  )
}

export default TabItemView;

import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faUpDownLeftRight, faFile, faFolder, faCircleXmark} from "@fortawesome/free-solid-svg-icons";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {getItemId, getShortName} from "@/components/tab/tab.ts";
import {TabItem} from "@/bindings.ts";
import {renderTreeFromPath} from "@/components/tree/tree.ts";
import {useFolderTreeStore} from "@/components/tree/stores/folderTreeStore.ts";
import {useFolderTreeRefStore} from "@/components/tree/stores/folderTreeRefStore.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";

interface Props {
  item: TabItem
  removeItem: (item: TabItem) => void
}

function TabItemView({ item, removeItem }: Props) {
  const {folderTree, setFolderTree} = useFolderTreeStore()
  const {folderTreeRef} = useFolderTreeRefStore()
  const {selectedItem, setSelectedItem} = useSelectedTreeItemStore()

  const sortable = useSortable({
    id: getItemId(item),
  });
  const mergedProps = {
    ...sortable.attributes,
    ...sortable.listeners,
  };

  const style = {
    transform: CSS.Translate.toString(sortable.transform),
  };

  const clickTab = async (item: TabItem) => {
    console.log('clickTab', item);
    await renderTreeFromPath({
      fullPath: item.full_path,
      folderTree,
      setFolderTree,
      folderTreeRef,
      setSelectedItem,
      selectedItem
    })


  }

  return (
    <div className={`tab-item ${selectedItem?.full_path == item.full_path ? 'selected' : ''}`}
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
        <Icon icon={item.dir ? faFolder : faFile} />
      </div>
      <div className="tab-name"
           title={item.full_path}
           onClick={()=> clickTab(item)}
      >
        {getShortName(item.full_path)}
      </div>
      <div className="tab-close" onClick={() => removeItem(item)}>
        <Icon icon={faCircleXmark} />
      </div>
    </div>
  )
}

export default TabItemView;

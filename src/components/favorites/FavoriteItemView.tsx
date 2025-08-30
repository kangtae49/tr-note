import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faUpDownLeftRight, faFile, faFolder, faCircleXmark} from "@fortawesome/free-solid-svg-icons";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {getItemId, getShortName} from "@/components/favorites/favorites.ts";
import {FavoriteItem} from "@/bindings.ts";
import {useRenderTreeFromPath} from "@/components/tree/tree.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";

interface Props {
  item: FavoriteItem
  removeItem: (item: FavoriteItem) => void
}

function FavoriteItemView({ item, removeItem }: Props) {
  const {selectedItem} = useSelectedTreeItemStore()
  const {renderTreeFromPath} = useRenderTreeFromPath();

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

  const clickFavorite = async (item: FavoriteItem) => {
    console.log('clickFavorite', item);
    await renderTreeFromPath(item.full_path)
  }

  return (
    <div className={`favorite-item ${selectedItem?.full_path == item.full_path ? 'selected' : ''}`}
         ref={(node) => {
           sortable.setNodeRef(node);
         }}
         style={style}>
      <div className="favorite-icon"
           {...mergedProps}
      >
        <Icon icon={faUpDownLeftRight} />
      </div>
      <div className="favorite-icon"
           onClick={()=> clickFavorite(item)}
      >
        <Icon icon={item.dir ? faFolder : faFile} />
      </div>
      <div className="favorite-name"
           title={item.full_path}
           onClick={()=> clickFavorite(item)}
      >
        {getShortName(item.full_path)}
      </div>
      <div className="favorite-close" onClick={() => removeItem(item)}>
        <Icon icon={faCircleXmark} />
      </div>
    </div>
  )
}

export default FavoriteItemView;

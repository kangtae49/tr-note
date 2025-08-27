import {DndContext, DragEndEvent, DragStartEvent} from "@dnd-kit/core";
import SortableContainer from "@/components/tab/SortableContainer.tsx";
import {useEffect} from "react";
import {arrayMove, horizontalListSortingStrategy, SortableContext} from "@dnd-kit/sortable";
import FavoriteItemView from "@/components/favorites/FavoriteItemView.tsx";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useFavoritesStore} from "@/components/favorites/stores/favoritesStore.ts";
import "./favorites.css"
import {commands, FavoriteItem} from "@/bindings.ts";
import {getItemId} from "@/components/favorites/favorites.ts";


export default function FavoritesView() {
  const favorites = useFavoritesStore((state) => state.favorites);
  const setFavorites = useFavoritesStore((state) => state.setFavorites);

  const removeItem = (favoriteItem: FavoriteItem) => {
    if (favorites === undefined) return;
    setFavorites(favorites.filter((item: FavoriteItem) => getItemId(item) !== getItemId(favoriteItem)));
  }

  function handleDragStart(event: DragStartEvent) {
    if (event.active.id === "source") {
      return;
    }

    const findItem = favorites?.find((c) => getItemId(c) == event.active.id);
    if (findItem) {
      console.log('findItem:', findItem)
    }

  }

  function handleDragEnd(event: DragEndEvent) {
    if (favorites === undefined) return;
    const { active, over } = event;

    if (!over) {
      return;
    }

    let activeId = active.id.toString();
    let overId = over.id.toString();

    if (overId == 'target') {
      const last = favorites.slice(-1);
      if (last.length > 0) {
        overId = getItemId(last[0]);
      }
    }
    const activeIndex = favorites.findIndex((item) => getItemId(item) === activeId);
    const overIndex = favorites.findIndex((item) => getItemId(item) === overId);
    if (activeIndex !== -1 && overIndex !== -1) {
      const sortedItem = arrayMove<FavoriteItem>(favorites || [], activeIndex, overIndex);
      setFavorites(sortedItem);
    }

  }


  useEffect(() => {
    if (favorites == undefined) return;
    commands.saveFavorite({
      items: favorites
    }).then(res => {
      if (res.status === "ok") {
        console.log('saveFavorite success')
      } else {
        console.log('saveFavorite failed', res)
      }
    })
  }, [favorites])


  useEffect(() => {
    // load favorite items
    commands.loadFavorite().then(res => {
      if (res.status === "ok") {
        const favoriteJson = res.data;
        setFavorites(favoriteJson.items);
      } else {
        console.log('loadFavorite failed', res)
      }
    })
  }, [])

  // useEffect(() => {
  //   if (selectedTreeItem == undefined) return;
  //   setFavorites([selectedTreeItem])
  // }, [selectedTreeItem])

  return (
    <div className="favorites-view">
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}>
        <SortableContainer id="target_favorite">
          <div className="favorite-list">
            {(favorites != undefined) && (
              <SortableContext items={favorites.map(item => getItemId(item))} strategy={horizontalListSortingStrategy}>
                {(favorites).map((favoriteItem, _index: number) => {
                  return (
                    <FavoriteItemView key={getItemId(favoriteItem)} item={favoriteItem} removeItem={removeItem} />
                  )
                })}
              </SortableContext>
            )}
          </div>
        </SortableContainer>
      </DndContext>
    </div>
  );
}

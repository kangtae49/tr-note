import {DndContext, DragEndEvent, DragStartEvent} from "@dnd-kit/core";
import SortableContainer from "@/components/tab/SortableContainer.tsx";
import {useEffect} from "react";
import {arrayMove, horizontalListSortingStrategy, SortableContext} from "@dnd-kit/sortable";
import TabItemView from "@/components/tab/TabItemView.tsx";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useTabItemsStore} from "@/components/tab/stores/tabItemsStore.ts";
import "./tab.css"
import {commands, TabItem} from "@/bindings.ts";
import {getItemId} from "@/components/tab/tab.ts";


export default function TabView() {
  const {tabItems, setTabItems} = useTabItemsStore();

  const removeItem = (tabItem: TabItem) => {
    if (tabItems === undefined) return;
    setTabItems(tabItems.filter((item: TabItem) => getItemId(item) !== getItemId(tabItem)));
  }

  function handleDragStart(event: DragStartEvent) {
    if (event.active.id === "source") {
      return;
    }

    const findItem = tabItems?.find((c) => getItemId(c) == event.active.id);
    if (findItem) {
      console.log('findItem:', findItem)
    }

  }

  function handleDragEnd(event: DragEndEvent) {
    if (tabItems === undefined) return;
    const { active, over } = event;

    if (!over) {
      return;
    }

    let activeId = active.id.toString();
    let overId = over.id.toString();

    if (overId == 'target') {
      const last = tabItems.slice(-1);
      if (last.length > 0) {
        overId = getItemId(last[0]);
      }
    }
    const activeIndex = tabItems.findIndex((item) => getItemId(item) === activeId);
    const overIndex = tabItems.findIndex((item) => getItemId(item) === overId);
    if (activeIndex !== -1 && overIndex !== -1) {
      const sortedItem = arrayMove<TabItem>(tabItems || [], activeIndex, overIndex);
      setTabItems(sortedItem);
    }

  }


  useEffect(() => {
    if (tabItems == undefined) return;
    commands.saveTab({
      items: tabItems
    }).then(res => {
      if (res.status === "ok") {
        console.log('saveTab success')
      } else {
        console.log('saveTab failed', res)
      }
    })
  }, [tabItems])


  useEffect(() => {
    // load tab items
    commands.loadTab().then(res => {
      if (res.status === "ok") {
        const tabJson = res.data;
        setTabItems(tabJson.items);
      } else {
        console.log('loadTab failed', res)
      }
    })
  }, [])

  // useEffect(() => {
  //   if (selectedTreeItem == undefined) return;
  //   setTabItems([selectedTreeItem])
  // }, [selectedTreeItem])

  return (
    <div className="tab-view">
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}>
        <SortableContainer id="target">
          <div className="tab-list">
            {(tabItems != undefined) && (
              <SortableContext items={tabItems.map(item => getItemId(item))} strategy={horizontalListSortingStrategy}>
                {(tabItems).map((tabItem, _index: number) => {
                  return (
                    <TabItemView key={getItemId(tabItem)} item={tabItem} removeItem={removeItem} />
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

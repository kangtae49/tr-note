import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faUpDownLeftRight, faFile, faFolder, faCircleXmark} from "@fortawesome/free-solid-svg-icons";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {commands, TabItem} from "@/bindings.ts";
import {getItemId, getShortName, useRenderTreeFromPath} from "@/components/tree/tree.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import React, {useCallback, useState} from "react";
import {useFileContent} from "@/stores/contentsStore.ts";
import {useFileSavedContent} from "@/stores/savedContentsStore.ts";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {useTab} from "@/components/tab/stores/tabItemsStore.ts";
import {equalsContent} from "@/components/file_views/ExcalidrawView.tsx";
import {useSaveKey} from "@/stores/saveKeyStore.ts";

interface Props {
  item: TabItem
  removeItem: (item: TabItem) => void
}

function TabItemView({ item, removeItem }: Props) {
  const {selectedItem} = useSelectedTreeItemStore()
  const {renderTreeFromPath} = useRenderTreeFromPath();
  const {content, setContent} = useFileContent<string | undefined>(item?.full_path);
  const {savedContent} = useFileSavedContent<string | undefined>(item?.full_path);
  const [openMenu, setOpenMenu] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const {removeTab} = useTab();
  const {setSaveKey} = useSaveKey(item.full_path);

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
    await renderTreeFromPath(item.full_path)
  }

  const clickCloseTab = useCallback(async (e: React.MouseEvent) => {
    console.log('clickCloseTab', item);
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    if (content == undefined || savedContent == undefined){
      removeItem(item);
    } else if (item.full_path.endsWith('.excalidraw')) {
      if (equalsContent(content, savedContent)) {
        removeItem(item);
      } else {
        setOpenMenu(true);
      }
    } else {
      if (content == savedContent) {
        removeItem(item);
      } else {
        setOpenMenu(true);
      }
    }
  }, [content, savedContent]);

  const clickSaveAndClose = () => {
    console.log('clickSaveAndClose', item);
    if (content !== undefined) {
      commands.saveFile(item.full_path, content).then((res) => {
        if (res.status === 'ok') {
          removeTab(item);
        }
      })
    }
  }
  const clickNotSaveAndClose = () => {
    console.log('clickNotSaveAndClose', item);
    setContent(savedContent);
    setSaveKey(String(Date.now()))
    removeTab(item);
  }
  const clickCancel = () => {
    console.log('clickCancel', item);
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
      <div className="tab-close" onClick={clickCloseTab}>
        <Icon icon={faCircleXmark} />
      </div>
      <DropdownMenu.Root open={openMenu} onOpenChange={setOpenMenu}>
        <DropdownMenu.Content className="context-menu" style={{
          position: 'fixed',
          top: position.y,
          left: position.x - 150,
        }}>
          <DropdownMenu.Item className="context-menu-item" onSelect={() => clickSaveAndClose()}>
            <Icon icon={item.dir ? faFolder : faFile}/> Save And Close
          </DropdownMenu.Item>
          <DropdownMenu.Item className="context-menu-item" onSelect={() => clickNotSaveAndClose()}>
            <Icon icon={item.dir ? faFolder : faFile}/> Don't Save And Close
          </DropdownMenu.Item>
          <DropdownMenu.Item className="context-menu-item" onSelect={() => clickCancel()}>
            <Icon icon={item.dir ? faFolder : faFile}/> Cancel
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}

export default TabItemView;

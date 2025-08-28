import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faUpDownLeftRight, faFile, faFolder, faCircleXmark} from "@fortawesome/free-solid-svg-icons";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {getItemId, getShortName} from "@/components/tab/tab.ts";
import {commands, TabItem} from "@/bindings.ts";
import {renderTreeFromPath} from "@/components/tree/tree.ts";
import {useFolderTreeStore} from "@/components/tree/stores/folderTreeStore.ts";
import {useFolderTreeRefStore} from "@/components/tree/stores/folderTreeRefStore.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import React, {useContext, useState} from "react";
import {useFileContent} from "@/stores/contentsStore.ts";
import {useFileSavedContent} from "@/stores/savedContentsStore.ts";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {useTab} from "@/components/tab/stores/tabItemsStore.ts";

interface Props {
  item: TabItem
  removeItem: (item: TabItem) => void
}

function TabItemView({ item, removeItem }: Props) {
  const {folderTree, setFolderTree} = useFolderTreeStore()
  const {folderTreeRef} = useFolderTreeRefStore()
  const {selectedItem, setSelectedItem} = useSelectedTreeItemStore()
  const {content, setContent} = useFileContent<string | undefined>(item?.full_path);
  const {savedContent, setSavedContent} = useFileSavedContent<string | undefined>(item?.full_path);
  const [openMenu, setOpenMenu] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const {removeTab} = useTab();

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

  const clickCloseTab = async (e: React.MouseEvent) => {
    console.log('clickCloseTab', item);
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    if (content == savedContent) {
      removeItem(item);
    } else {
      setOpenMenu(true);
    }
  }

  const clickSaveAndClose = () => {
    console.log('clickSaveAndClose', item);
    if (savedContent !== undefined) {
      commands.saveFile(item.full_path, savedContent).then((res) => {
        if (res.status === 'ok') {
          removeTab(item);
        }
      })
    }
  }
  const clickNotSaveAndClose = () => {
    console.log('clickNotSaveAndClose', item);
    setContent(savedContent);
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

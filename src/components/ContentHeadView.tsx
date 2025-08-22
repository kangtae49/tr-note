import React from 'react'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faStar, faFolder, faFile, faArrowUp, faRocket } from '@fortawesome/free-solid-svg-icons'
import {useFolderTreeStore} from "@/components/tree/stores/folderTreeStore.ts";
import {useFolderTreeRefStore} from "@/components/tree/stores/folderTreeRefStore.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {renderTreeFromPath, SEP, TreeItem} from "@/components/tree/tree.ts";
import * as utils from "@/components/utils.ts";
import {useTabItemsStore} from "@/components/tab/stores/tabItemsStore.ts";
import {includesTabItem} from "@/components/tab/tab.ts";
import TabView from "@/components/tab/TabView.tsx";
function ContentHeadView() {
  const folderTree = useFolderTreeStore((state) => state.folderTree)
  const setFolderTree = useFolderTreeStore((state) => state.setFolderTree)
  const folderTreeRef = useFolderTreeRefStore((state) => state.folderTreeRef)
  const setSelectedItem = useSelectedTreeItemStore((state) => state.setSelectedItem)
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const tabItems = useTabItemsStore((state) => state.tabItems);
  const setTabItems = useTabItemsStore((state) => state.setTabItems);


  const toggleStar = async (treeItem?: TreeItem): Promise<void> => {
    console.log('toggleStar', treeItem);
    if (treeItem == undefined) return;
    if (tabItems == undefined) return;
    if (includesTabItem({full_path: treeItem.full_path, dir: treeItem.dir || false}, tabItems)){
      setTabItems(tabItems.filter((item) => item.full_path != treeItem.full_path))
    } else {
      setTabItems([{full_path: treeItem.full_path, dir: treeItem.dir || false}, ...tabItems])
    }

  }
  const clickPath = async (fullPath: string | undefined): Promise<void> => {
    if (fullPath) {
      await renderTreeFromPath({
        fullPath,
        folderTree,
        setFolderTree,
        folderTreeRef,
        setSelectedItem,
        selectedItem
      })
    }
  }
  let pathList: string[] = []
  let fullPathList: string[] = []

  if (selectedItem) {
    let fullPath = selectedItem.full_path
    if (fullPath.endsWith(`:${SEP}`)) {
      fullPath = fullPath.split(SEP).join("")
    }
    pathList = fullPath.split(SEP)
    fullPathList = pathList.map((_nm, idx) => {
      return pathList.slice(0, idx + 1).join(SEP)
    })
  }

  return (
    <div className="content-head">
      <div className="title-path">
        <div className="icon">
          <Icon icon={faStar} className={includesTabItem({full_path: selectedItem?.full_path || "", dir: selectedItem?.dir || false}, tabItems) ? "" : "inactive"} onClick={() => toggleStar(selectedItem)} />
        </div>
        <div className="icon">
          <Icon icon={faArrowUp} onClick={() => clickPath(selectedItem?.parent?.full_path)} />
        </div>
        <div className="icon">
          <Icon icon={faRocket} onClick={() => utils.shellOpenPath(selectedItem?.full_path)} />
        </div>
        <div
          className="icon"
          onClick={() => utils.shellShowItemInFolder(selectedItem?.full_path)}
        >
          <Icon icon={selectedItem?.dir ? faFolder: faFile} />
        </div>

        {fullPathList.map((fullPath, idx) => {
          return (
            <React.Fragment key={idx}>
              {idx != 0 ? SEP : null}
              <div className="part-list" title={fullPath} onClick={() => clickPath(fullPath)}>
                {pathList[idx]}
              </div>
            </React.Fragment>
          )
        })}

      </div>
      <TabView />
    </div>
  )
}

export default ContentHeadView

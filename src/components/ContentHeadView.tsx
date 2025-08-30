import React from 'react'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faStar, faPenToSquare, faFolder, faFile, faArrowUp, faRocket } from '@fortawesome/free-solid-svg-icons'
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {SEP, TreeItem, useRenderTreeFromPath} from "@/components/tree/tree.ts";
import * as utils from "@/components/utils.ts";
import {includesFavoriteItem} from "@/components/favorites/favorites.ts";
import {useFavorite} from "@/components/favorites/stores/favoritesStore.ts";
import {getTabFromFileItem} from "@/components/tab/tab.ts";
import {getFavoriteFromTreeItem} from "@/components/favorites/favorites.ts";
import {useTab} from "@/components/tab/stores/tabItemsStore.ts";
import {FileItem} from "@/bindings.ts";

function ContentHeadView() {
  const {selectedItem} = useSelectedTreeItemStore()
  const {favorites, addFavorite} = useFavorite();
  const {addTab} = useTab();
  const {renderTreeFromPath} = useRenderTreeFromPath();

  const toggleStar = async (treeItem?: TreeItem): Promise<void> => {
    console.log('toggleStar', treeItem);
    addFavorite(getFavoriteFromTreeItem(treeItem))
  }
  const clickAddTab = async (treeItem?: TreeItem): Promise<void> => {
    console.log('clickAddTab', treeItem);
    addTab(getTabFromFileItem(selectedItem as FileItem))
  }
  const clickPath = async (fullPath: string | undefined): Promise<void> => {
    if (fullPath) {
      await renderTreeFromPath(fullPath)
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
          <Icon icon={faStar} className={includesFavoriteItem(getFavoriteFromTreeItem(selectedItem), favorites) ? "" : "inactive"} onClick={() => toggleStar(selectedItem)} />
        </div>
        {!selectedItem?.dir && (
          <div className="icon">
            <Icon icon={faPenToSquare} onClick={() => clickAddTab(selectedItem)} />
          </div>
        )}
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
    </div>
  )
}

export default ContentHeadView

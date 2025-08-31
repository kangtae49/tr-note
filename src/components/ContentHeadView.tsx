import React from 'react'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faStar, faPenToSquare, faFolder, faFile, faArrowUp, faRocket } from '@fortawesome/free-solid-svg-icons'
import {
  getParentPath,
  includesPath,
  SEP,
  useRenderTreeFromPath
} from "@/components/tree/tree.ts";
import * as utils from "@/components/utils.ts";
import {useFavorite} from "@/components/favorites/stores/favoritesStore.ts";
import {useTab} from "@/components/tab/stores/tabItemsStore.ts";
import {FavoriteItem, FileItem, TabItem} from "@/bindings.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";

function ContentHeadView() {
  // const {fileViewItem} = useFileViewItemStore()
  const {selectedItem} = useSelectedTreeItemStore()
  const {favorites, addFavorite} = useFavorite();
  const {addTab} = useTab();
  const {renderTreeFromPath} = useRenderTreeFromPath();

  const toggleStar = async (fileItem?: FileItem): Promise<void> => {
    console.log('toggleStar', fileItem);
    addFavorite(fileItem as FavoriteItem)
  }
  const clickAddTab = async (fileItem?: FileItem): Promise<void> => {
    console.log('clickAddTab', fileItem);
    addTab(fileItem as TabItem)
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
  if (selectedItem == undefined) return null;
  return (
    <div className="content-head">

      <div className="title-path">
        <div className="icon">
          <Icon icon={faStar} className={includesPath(selectedItem.full_path, favorites) ? "" : "inactive"} onClick={() => toggleStar(selectedItem as FileItem)} />
        </div>
        {!selectedItem?.dir && (
          <div className="icon">
            <Icon icon={faPenToSquare} onClick={() => clickAddTab(selectedItem as FileItem)} />
          </div>
        )}
        <div className="icon">
          <Icon icon={faArrowUp} onClick={() => clickPath(getParentPath(selectedItem.full_path))} />
        </div>
        <div className="icon">
          <Icon icon={faRocket} onClick={() => utils.shellOpenPath(selectedItem.full_path)} />
        </div>
        <div
          className="icon"
          onClick={() => utils.shellShowItemInFolder(selectedItem.full_path)}
        >
          <Icon icon={selectedItem.dir ? faFolder: faFile} />
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

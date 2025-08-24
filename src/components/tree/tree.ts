import {commands, DiskInfo, HomeType, Item, OptParams} from "@/bindings.ts";
import {FolderTreeStore} from '@/components/tree/stores/folderTreeStore.ts'
import {FolderTreeRefStore} from '@/components/tree/stores/folderTreeRefStore.ts'
import {SelectedTreeItemStore} from '@/components/tree/stores/selectedTreeItemStore.ts'

export const SEP = '\\'
export const TREE_ITEM_SIZE = 18
export const TREE_DEPT_SIZE = 13
export const LIST_ITEM_SIZE = 18
export const LIST_HEAD_SIZE = 52
export const FILE_HEAD_SIZE = 25
export const SLIDER_SIZE = 20
export const SLIDER_STEP = 20

export type HomePathMap = Record<HomeType, string>
export type FolderTree = TreeItem[]
export type FolderList = TreeItem[]
export type TreeItem = {
  parent?: TreeItem
  nm: string
  full_path: string
  dir?: boolean
  ext?: string
  mt?: string
  sz?: number
  tm?: number
  items?: TreeItem[]
}
export type DirectoryViewType = 'DirectoryViewType' | 'GalleryViewType'

export type FolderListOrder = {
  key: FolderListOrderKey
  val: FolderListOrderVal
}
export type FolderListOrderKey = 'Nm' | 'Ext' | 'Tm' | 'Sz'
export type FolderListOrderVal = 'Asc' | 'Desc'


const treeParams: OptParams = {
  cache_nm: 'folder-tree',
  meta_types: ['Ext', 'Mt', 'Sz', 'Tm'],
  ordering: [
    { nm: 'Dir', asc: 'Asc' },
    { nm: 'Nm', asc: 'Asc' }
  ]
}

const fromDisk = (disk: DiskInfo): TreeItem => {
  return {
    nm: disk.path.split(SEP).join(""),
    full_path: disk.path,
    dir: true
  }
}

const fromItem = ({ item, parentTreeItem }: { item: Item; parentTreeItem: TreeItem }): TreeItem => {
  const basePath = parentTreeItem.full_path
  const fullPath = basePath.endsWith(`:${SEP}`)
    ? [basePath.split(SEP).join(""), item.nm].join(SEP)
    : [basePath, item.nm].join(SEP)
  const treeItem: TreeItem = {
    nm: item.nm.split(SEP).join(""),
    full_path: fullPath,
    parent: parentTreeItem.parent
  }
  if (item.dir != undefined) treeItem.dir = item.dir
  if (item.ext != undefined) treeItem.ext = item.ext
  if (item.mt != undefined) treeItem.mt = item.mt
  if (item.sz != undefined) treeItem.sz = Number(item.sz)
  if (item.tm != undefined) treeItem.tm = Number(item.tm)

  if (parentTreeItem) {
    treeItem.parent = parentTreeItem
  }
  return treeItem
}

export function getNthParent(item: TreeItem | undefined, n: number): TreeItem | undefined {
  let current = item
  let count = 0

  while (current && count < n) {
    current = current?.parent
    count++
  }

  return current
}

export function getNthOfTreeItems(
  treeItems: TreeItem[] | undefined,
  nth: number,
  curIdx = -1
): [TreeItem | undefined, number] {
  let findTreeItem: TreeItem | undefined = undefined
  if (!treeItems) {
    return [findTreeItem, curIdx]
  }
  for (let idxItem = 0; idxItem < treeItems.length; idxItem++) {
    curIdx++
    if (curIdx == nth) {
      findTreeItem = treeItems[idxItem]
      break
    }
    const [findItem, nextIdx] = getNthOfTreeItems(treeItems[idxItem]?.items, nth, curIdx)
    findTreeItem = findItem
    curIdx = nextIdx
    if (findTreeItem) {
      break
    }
  }
  return [findTreeItem, curIdx]
}

export function getNth(
  treeItems: TreeItem[] | undefined,
  item: TreeItem,
  curIdx = -1
): [TreeItem | undefined, number] {
  let findTreeItem: TreeItem | undefined = undefined
  if (!treeItems) {
    return [findTreeItem, curIdx]
  }
  for (let idxItem = 0; idxItem < treeItems.length; idxItem++) {
    curIdx++
    if (treeItems[idxItem].full_path == item.full_path) {
      findTreeItem = treeItems[idxItem]
      break
    }
    const [findItem, nextIdx] = getNth(treeItems[idxItem]?.items, item, curIdx)
    findTreeItem = findItem
    curIdx = nextIdx
    if (findTreeItem) {
      break
    }
  }
  return [findTreeItem, curIdx]
}

export function getCountOfTreeItems(treeItems: TreeItem[] | undefined): number {
  if (!treeItems) {
    return 0
  }
  let count = treeItems.length
  for (let idxItem = 0; idxItem < treeItems.length; idxItem++) {
    const treeItem = treeItems[idxItem]
    if (!treeItem.items) {
      continue
    }
    count += getCountOfTreeItems(treeItem.items)
  }
  return count
}

export const fetchDisks = async (): Promise<FolderTree> => {
  const res = await commands.getDisks();
  if (res.status === "ok") {
    const disks = res.data;
    return disks.map(fromDisk);
  }
  throw new Error("Failed to fetch disks");
}

export const fetchTreeItems = async ({
                                       treeItem,
                                       appendChildItems = true,
                                       folderListOrder
                                     }: {
  treeItem?: TreeItem
  appendChildItems?: boolean
  folderListOrder?: FolderListOrder
}): Promise<TreeItem[] | undefined> => {
  if (!treeItem) {
    return undefined
  }
  let params: OptParams = {
    ...treeParams,
    path_str: treeItem.full_path
  }
  if (folderListOrder) {
    if (folderListOrder.key == 'Nm') {
      params = {
        ...params,
        ordering: [
          { nm: 'Dir', asc: folderListOrder.val },
          { nm: 'Nm', asc: folderListOrder.val }
        ]
      }
    } else if (folderListOrder.key == 'Ext') {
      params = {
        ...params,
        ordering: [
          { nm: 'Dir', asc: folderListOrder.val },
          { nm: 'Ext', asc: folderListOrder.val },
          { nm: 'Nm', asc: folderListOrder.val }
        ]
      }
    } else if (folderListOrder.key == 'Sz') {
      params = {
        ...params,
        ordering: [
          { nm: 'Dir', asc: folderListOrder.val },
          { nm: 'Sz', asc: folderListOrder.val },
          { nm: 'Nm', asc: folderListOrder.val }
        ]
      }
    } else if (folderListOrder.key == 'Tm') {
      params = {
        ...params,
        ordering: [
          { nm: 'Dir', asc: folderListOrder.val },
          { nm: 'Tm', asc: folderListOrder.val },
          { nm: 'Nm', asc: folderListOrder.val }
        ]
      }
    }
  }
  const res = await commands.readFolder(params);
  let folder;
  if (res.status === "ok") {
    folder = res.data;
  } else {
    return undefined
  }

  const folderItems = folder?.item?.items
  if (folderItems) {
    const treeItems = folderItems.map((folderItem) => {
      return fromItem({ item: folderItem, parentTreeItem: treeItem })
    })
    if (appendChildItems) {
      treeItem.items = treeItems
      // if (treeItem.items && treeItem.tm != folder?.item?.tm) {
      //   treeItem.items = treeItems
      // } else {
      //   treeItem.items = treeItems
      // }
    }
    return treeItems
  }
  return undefined
}

export const fetchFolderTree = async ({
  fullPath,
  folderTree
}: {
  fullPath: string,
  folderTree: FolderTreeStore['folderTree']
}): Promise<[TreeItem[], TreeItem | undefined, number]> => {
  const paths = fullPath.split(SEP).filter((path) => path != '')
  // const folderTree = await fetchDisks();
  if (folderTree == undefined) {
    throw new Error('folderTree is undefined')
  }
  let parentTree = folderTree;
  let selectedItem: TreeItem | undefined
  let curIdx = 0
  for (let i = 0; i < paths.length; i++) {
    // const path = paths.slice(0, i + 1).join(SEP)
    const findItem = parentTree.find((treeItem) => treeItem.nm === paths[i])
    if (findItem == undefined) {
      break
    }
    selectedItem = findItem
    curIdx += parentTree.indexOf(findItem)
    if (i == paths.length - 1) {
      break
    }

    findItem.items = []

    // if (!findItem.items) {
      const fetchItems = await fetchTreeItems({ treeItem: selectedItem })
      if (fetchItems !== undefined) {
        parentTree = fetchItems
        findItem.items = fetchItems
      } else {
        break
      }
    // } else {
    //   parentTree = findItem.items
    // }

    curIdx++
  }
  return [folderTree, selectedItem, curIdx]
}

export const renderTreeFromPath = async ({
    fullPath,
    folderTree,
    setFolderTree,
    folderTreeRef,
    setSelectedItem
       }: {
  fullPath: string
  folderTree: FolderTreeStore['folderTree']
  setFolderTree: FolderTreeStore['setFolderTree']
  folderTreeRef: FolderTreeRefStore['folderTreeRef']
  setSelectedItem: SelectedTreeItemStore['setSelectedItem']
  selectedItem: SelectedTreeItemStore['selectedItem']
}): Promise<void> => {
  if (fullPath == '/' || fullPath.endsWith(SEP)) {
    fetchDisks().then((disks) => {
      if (folderTree === undefined) {
        setFolderTree(disks)
      } else {
        let new_disk = [];
        for (const disk of disks) {
          const findItem = folderTree.find((item) => item.full_path === disk.full_path);
          if (findItem == undefined) {
            new_disk.push(disk);
          } else {
            new_disk.push(findItem);
            setSelectedItem({...findItem});
          }
        }
        setFolderTree(new_disk);
      }
    })
  } else {
    fetchFolderTree({ fullPath, folderTree }).then(([newFolderTree, newSelectedItem]) => {
      if (newFolderTree && newSelectedItem) {
        if (newSelectedItem.dir) {
          console.log('newSelectedItem:', newSelectedItem);
          foldDirectory({treeItem: newSelectedItem}).then(()=> {
            if (folderTree !== undefined) {
              setFolderTree([...folderTree]);
            }
          });
        }
        setFolderTree([...newFolderTree])
        setSelectedItem({...newSelectedItem})
        scrollToItem({ selectedItem: newSelectedItem, folderTree: newFolderTree, folderTreeRef })
      }
      // const totalCount = getCountOfTreeItems(newFolderTree)
      // if (document.querySelector('.folder-tree')?.scrollHeight == totalCount * TREE_ITEM_SIZE) {
      //   folderTreeRef?.current?.scrollToItem(newSelectedIndex, 'center')
      // } else {
      //   setTimeout(() => {
      //     folderTreeRef?.current?.scrollToItem(newSelectedIndex, 'center')
      //   }, 100)
      // }
    })
  }
}

export const toggleDirectory = async ({ treeItem }: { treeItem?: TreeItem }): Promise<void> => {
  if (treeItem?.dir) {
    if (!treeItem.items) {
      const treeItems = await fetchTreeItems({ treeItem })
      if (!treeItems) {
        delete treeItem.items
      }
    } else {
      delete treeItem.items
    }
  }
}

export const foldDirectory = async ({ treeItem }: { treeItem?: TreeItem }): Promise<void> => {
  if (treeItem?.dir) {
    if (treeItem.items != undefined) {
      delete treeItem.items
    }
    const treeItems = await fetchTreeItems({ treeItem })
    if (treeItems == undefined) {
      delete treeItem.items
    }
  }
}
export const unfoldDirectory = async ({ treeItem }: { treeItem?: TreeItem }): Promise<void> => {
  if (treeItem?.dir) {
    if (treeItem.items != undefined) {
      delete treeItem.items
    }
  }
}

export const scrollToItem = async ({
                                     folderTree,
                                     selectedItem,
                                     folderTreeRef
                                   }: {
  selectedItem: TreeItem
  folderTree: FolderTreeStore['folderTree']
  folderTreeRef: FolderTreeRefStore['folderTreeRef']
}): Promise<void> => {
  const [, nth] = getNth(folderTree, selectedItem)
  const totalCount = getCountOfTreeItems(folderTree)
  let scrollHeight = document.querySelector('.folder-tree')?.scrollHeight || 0
  scrollHeight = Math.floor(scrollHeight / TREE_ITEM_SIZE) * TREE_ITEM_SIZE
  console.log('scroll:', scrollHeight, totalCount, totalCount * TREE_ITEM_SIZE, nth)
  // setTimeout(() => {
  //   console.log('setTimeout scroll:', nth, folderTreeRef?.current)
  //   folderTreeRef?.current?.scrollToItem(nth, 'auto')
  // }, 500)

  if (scrollHeight == totalCount * TREE_ITEM_SIZE) {
    requestAnimationFrame(() => {
      folderTreeRef?.current?.scrollToItem(nth, 'auto')
    })
  } else {
    setTimeout(() => {
      console.log('setTimeout scroll:', nth, folderTreeRef?.current)
      folderTreeRef?.current?.scrollToItem(nth, 'auto')
    }, 100)
  }
}

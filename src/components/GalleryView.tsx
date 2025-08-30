import React, {useEffect} from "react";
import "@/components/directory.css"
import { FixedSizeList as List } from 'react-window'
import {fetchTreeItems, LIST_HEAD_SIZE, listParams, SLIDER_SIZE, SLIDER_STEP} from "@/components/tree/tree.ts";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useFolderListOrderStore} from "@/stores/folderListOrderStore.ts";
import {useFolderListStore} from "@/stores/folderListStore.ts";
import {useFolderListSliderStore} from "@/stores/folderListSliderStore.ts";
import AutoSizer from "react-virtualized-auto-sizer";
import GalleryItemView from "@/components/GalleryItemView.tsx";

function GalleryView() {
  const {selectedItem} = useSelectedTreeItemStore()
  const {folderListOrder} = useFolderListOrderStore()
  const {folderList, setFolderList} = useFolderListStore()
  const {sliderPos, setSliderPos} = useFolderListSliderStore()

  const onChangeSliderX = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const maxX = Number((document.querySelector('.slider-w input') as HTMLInputElement).max)
    const maxY = Number((document.querySelector('.slider-h input') as HTMLInputElement).max)
    const x = Number(event.target.value)
    const newPos = { ...sliderPos, x, maxX, maxY }
    if (newPos.checked) {
      newPos.y = Number(event.target.value)
    }
    if (newPos.x > newPos.maxX) {
      newPos.x = newPos.maxX
    }
    if (newPos.y > newPos.maxY) {
      newPos.y = newPos.maxY
    }
    if (newPos != sliderPos) {
      setSliderPos(newPos)
    }
  }
  const onChangeSliderY = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const maxX = Number((document.querySelector('.slider-w input') as HTMLInputElement).max)
    const maxY = Number((document.querySelector('.slider-h input') as HTMLInputElement).max)
    const y = Number(event.target.value)
    const newPos = { ...sliderPos, y, maxX, maxY }
    if (newPos.checked) {
      newPos.x = Number(event.target.value)
    }
    if (newPos.x > newPos.maxX) {
      newPos.x = newPos.maxX
    }
    if (newPos.y > newPos.maxY) {
      newPos.y = newPos.maxY
    }
    if (newPos != sliderPos) {
      setSliderPos(newPos)
    }
  }
  const onChangeSliderChecked = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const checked = event.target.checked
    const newPos = { ...sliderPos, checked }
    if (newPos != sliderPos) {
      setSliderPos(newPos)
    }
  }

  useEffect(() => {
    fetchTreeItems({ treeItem: selectedItem, appendChildItems: false, folderListOrder, optParams: listParams }).then(
      (fetchItems) => setFolderList(fetchItems)
    )
  }, [folderListOrder, selectedItem, setFolderList])

  return (
    <div className="gallery-view">
      <AutoSizer>
        {({ height, width }) => {
          const countPerRow = Math.floor(width / sliderPos.x)
          const countY = Math.ceil((folderList?.length || 0) / countPerRow)
          // console.log(
          //   'length',
          //   folderList?.length,
          //   'width',
          //   width,
          //   'sliderPos',
          //   sliderPos,
          //   'countY',
          //   countY,
          //   'countPerRow',
          //   countPerRow
          // )
          return (
            <>
              <div className="slider-top">
                <div className="slider-chk">
                  <input
                    type="checkbox"
                    checked={sliderPos.checked}
                    onChange={onChangeSliderChecked}
                  />
                </div>
                <div className="slider-w">
                  <input
                    type="range"
                    name="slider"
                    step={SLIDER_STEP}
                    min={0}
                    max={width - SLIDER_SIZE}
                    style={{ width: width - SLIDER_SIZE }}
                    value={sliderPos.x}
                    onChange={onChangeSliderX}
                  />
                </div>
              </div>
              <div
                className="slider-left"
                style={{
                  width: width,
                  height: height - LIST_HEAD_SIZE - SLIDER_SIZE
                }}
              >
                <div
                  className="slider-h"
                  style={{
                    width: SLIDER_SIZE,
                    height: height - LIST_HEAD_SIZE - SLIDER_SIZE
                  }}
                >
                  <input
                    type="range"
                    name="slider"
                    step={SLIDER_STEP}
                    min={0}
                    max={height - LIST_HEAD_SIZE - SLIDER_SIZE}
                    style={{
                      height: height - LIST_HEAD_SIZE - SLIDER_SIZE
                    }}
                    value={sliderPos.y}
                    onChange={onChangeSliderY}
                  />
                </div>
                <List
                  className="folder-gallery"
                  height={height - LIST_HEAD_SIZE - SLIDER_SIZE}
                  itemCount={countY}
                  itemSize={sliderPos.y}
                  width={width}
                >
                  {({ index, style }) => {
                    const rowTreeItems = (folderList || []).slice(
                      index * countPerRow,
                      index * countPerRow + countPerRow
                    )
                    if (rowTreeItems.length < countPerRow) {
                      rowTreeItems.push(...Array(countPerRow - rowTreeItems.length).fill(undefined))
                    }
                    return rowTreeItems ? (
                      <GalleryItemView
                        key={index}
                        style={style}
                        sliderPos={sliderPos}
                        rowTreeItems={rowTreeItems}
                      />
                    ) : null
                  }}
                </List>
              </div>
            </>
          )
        }}
      </AutoSizer>
    </div>
  )
}

export default GalleryView;

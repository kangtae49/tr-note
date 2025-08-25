import {TreeItem} from "@/components/tree/tree.ts";
import * as monaco from "monaco-editor";
import {faFileCode, faFileLines, faFileImage} from "@fortawesome/free-solid-svg-icons";

export type FileViewType =
  | 'Img'
  | 'Embed'
  | 'Monaco'
  | 'Md'
  | 'Excalidraw'
  | 'Video'
  | 'Audio'
  | 'Empty'
  | 'None'
export type FileViewTypeGroup =
  | 'Binary'
  | 'Image'
  | 'Pdf'
  | 'Md'
  | 'Excalidraw'
  | 'Audio'
  | 'Video'
  | 'UnknownEmpty'
  | 'UnknownSmall'
  | 'Unknown'
export type FileViewTypeGroupMap = {
  [key in FileViewTypeGroup]: FileViewType[];
}
export type FileViewTypeMap = {
  [key in FileViewTypeGroup]: FileViewType;
}
export const fileViewTypeGroupMap: FileViewTypeGroupMap = {
  Binary: ["None"],
  Image: ["Img"],
  Pdf: ["Embed"],
  Md: ["Monaco", "Md"],
  Excalidraw: ["Excalidraw", "Monaco"],
  Video: ["Video"],
  Audio: ["Audio"],
  UnknownEmpty: ["Monaco"],
  UnknownSmall: ["Monaco"],
  Unknown: ["None"],
}

export const defaultFileViewTypeOfGroup: FileViewTypeMap = {
  Binary: "None",
  Image: "Img",
  Pdf: "Embed",
  Md: "Md",
  Excalidraw: "Excalidraw",
  Video: "Video",
  Audio: "Audio",
  UnknownEmpty: "Empty",
  UnknownSmall: "Monaco",
  Unknown: "None",
}

export function getFileTypeGroup(treeItem?: TreeItem): FileViewTypeGroup {
  if (treeItem?.dir) {
    return 'Unknown'
  }
  let fileViewTypeGroup: FileViewTypeGroup
  const sz = treeItem?.sz || 0
  // if (sz == 0) {
  //   fileViewTypeGroup = 'UnknownEmpty'
  // } else
  if (['exe', 'com', 'msi', 'dll', 'zip'].includes(treeItem?.ext || '')) {
    fileViewTypeGroup = 'Binary'
  } else if  (treeItem?.ext === 'excalidraw') {
    fileViewTypeGroup = 'Excalidraw'
  } else if (treeItem?.mt?.startsWith('image/')) {
    fileViewTypeGroup = 'Image'
  } else if (treeItem?.mt?.endsWith('/pdf')) {
    fileViewTypeGroup = 'Pdf'
  } else if (treeItem?.mt?.endsWith('/html') && sz < 2 * 1024 * 1024) {
    fileViewTypeGroup = 'Md'
  } else if (treeItem?.mt?.endsWith('/markdown') && sz < 2 * 1024 * 1024) {
    fileViewTypeGroup = 'Md'
  } else if (treeItem?.mt?.startsWith('audio/') && sz > 1024 * 500) {
    fileViewTypeGroup = 'Audio'
  } else if (treeItem?.mt?.startsWith('video/') && sz > 1024 * 500) {
    fileViewTypeGroup = 'Video'
  } else if (sz <= 5 * 1024 * 1024) {
    fileViewTypeGroup = 'UnknownSmall'
  } else {
    fileViewTypeGroup = 'Unknown'
  }
  return fileViewTypeGroup

}

export function getMonacoLanguage(ext?: string): string {
  let language = 'plaintext'
  if (!ext) {
    return 'plaintext'
  }
  const languages = monaco.languages.getLanguages()
  // console.log('languages', languages)
  const lang = languages.find((lang) => lang.extensions?.includes(`.${ext}`))
  if (lang) {
    language = lang.id
  }
  return language
}

export function isMonacoFile(ext?: string): boolean {
  if (!ext) {
    return false
  }
  const languages = monaco.languages.getLanguages()
  const lang = languages.find((lang) => lang.extensions?.includes(`.${ext}`))
  return !!lang
}

export function getFileViewIcon(fileViewType: FileViewType) {
  switch (fileViewType) {
    case "Monaco":
      return faFileCode
    case "Excalidraw":
      return faFileImage;
    default:
      return faFileLines
  }
}
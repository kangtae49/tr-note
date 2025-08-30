import {TreeItem} from "@/components/tree/tree.ts";
import * as monaco from "monaco-editor";
import {faFileCode, faFileLines, faFileImage} from "@fortawesome/free-solid-svg-icons";
import {commands, FileItem} from "@/bindings.ts";

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
  | 'Error'

export type FileViewTypeGroup =
  | 'GroupBinary'
  | 'GroupBinarySmall'
  | 'GroupImage'
  | 'GroupImageText'
  | 'GroupPdf'
  | 'GroupMd'
  | 'GroupExcalidraw'
  | 'GroupAudio'
  | 'GroupVideo'
  | 'GroupUnknownEmpty'
  | 'GroupUnknownSmall'
  | 'GroupUnknown'

export type FileViewTypeGroupMap = {
  [key in FileViewTypeGroup]: FileViewType[];
}
export type FileViewTypeMap = {
  [key in FileViewTypeGroup]: FileViewType;
}
export const fileViewTypeGroupMap: FileViewTypeGroupMap = {
  GroupBinary: ["None"],
  GroupBinarySmall: ["Monaco"],
  GroupImage: ["Img"],
  GroupImageText: ["Img", "Monaco"],
  GroupPdf: ["Embed"],
  GroupMd: ["Monaco", "Md"],
  GroupExcalidraw: ["Excalidraw", "Monaco"],
  GroupVideo: ["Video"],
  GroupAudio: ["Audio"],
  GroupUnknownEmpty: ["Monaco"],
  GroupUnknownSmall: ["Monaco"],
  GroupUnknown: ["None"],
}

export const defaultFileViewTypeOfGroup: FileViewTypeMap = {
  GroupBinary: "None",
  GroupBinarySmall: "Monaco",
  GroupImage: "Img",
  GroupImageText: "Img",
  GroupPdf: "Embed",
  GroupMd: "Md",
  GroupExcalidraw: "Excalidraw",
  GroupVideo: "Video",
  GroupAudio: "Audio",
  GroupUnknownEmpty: "Empty",
  GroupUnknownSmall: "Monaco",
  GroupUnknown: "None",
}


export const getFileItem = async (treeItem?: TreeItem) => {
  if (treeItem == undefined) {
    throw new Error('Not Found')
  }
  return commands.getFileItem(treeItem?.full_path, ["Ext", "Mt", "Sz", "Tm"])
    .then((res) => {
      if (res.status == 'ok') {
        return res.data;
      } else {
        throw res.error;
      }
    })
  ;
}

export const getFileViewInfo = async (fileItem?: FileItem): Promise<FileViewTypeGroup> => {

  if (fileItem == undefined ||  fileItem?.dir) {
    return 'GroupUnknown'
  }
  // let inferMimeType = '';
  // let mimeType = '';
  // let sz = 0;
  // let ext = '';
  // let fileItem = {
  //   ...treeItem
  // } as Item;
  // let resItem = await commands.getFileItem(treeItem?.full_path, ["Ext", "Mt", "Sz", "Tm"]);

  // if (resItem.status === 'ok') {
  //   const item = resItem.data;
  //   fileItem = {
  //     ...item
  //   }
  // }
  let mimeType = fileItem.mt ?? '';
  let inferMimeType
  let sz = fileItem.sz ?? 0;
  let ext = fileItem.ext ?? '';

  let resMime = await commands.getInferMimeType(fileItem?.full_path);
  if (resMime.status === 'ok') {
    inferMimeType = resMime.data;
  } else {
    console.log(`${Object.values(resMime.error)[0]}`)
    throw resMime.error;
  }

  let fileViewTypeGroup: FileViewTypeGroup
  // const sz = treeItem?.sz || 0;
  // const ext = treeItem?.ext;
  // const mimeType = treeItem?.mt || '';
  const binaryMimeTypes = [
    'application/vnd.microsoft.portable-executable',
    'application/zip',
    'application/x-msdownload',
    'application/x-ole-storage',
    'application/octet-stream',
  ]

  if (ext === 'excalidraw') {
    fileViewTypeGroup = 'GroupExcalidraw'
  } else if (mimeType.startsWith('image/') && inferMimeType?.startsWith('text')) {
    fileViewTypeGroup = 'GroupImageText'
  } else if (mimeType.startsWith('image/')) {
    fileViewTypeGroup = 'GroupImage'
  } else if (mimeType.endsWith('/pdf')) {
    fileViewTypeGroup = 'GroupPdf'
  } else if (mimeType.endsWith('/html') && sz < 2 * 1024 * 1024) {
    fileViewTypeGroup = 'GroupMd'
  } else if (mimeType.endsWith('/markdown') && sz < 2 * 1024 * 1024) {
    fileViewTypeGroup = 'GroupMd'
  } else if (mimeType.startsWith('audio/') && sz > 1024 * 500) {
    fileViewTypeGroup = 'GroupAudio'
  } else if (mimeType.startsWith('video/') && sz > 1024 * 500) {
    fileViewTypeGroup = 'GroupVideo'
  } else if (binaryMimeTypes.includes(inferMimeType || '') && sz < 2 * 1024 * 1024) {
    fileViewTypeGroup = 'GroupBinarySmall'
  } else if (binaryMimeTypes.includes(inferMimeType || '')) {
    fileViewTypeGroup = 'GroupBinary'
  } else if (sz <= 5 * 1024 * 1024) {
    fileViewTypeGroup = 'GroupUnknownSmall'
  } else {
    fileViewTypeGroup = 'GroupUnknown'
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

// export function isMonacoFile(ext?: string): boolean {
//   if (!ext) {
//     return false
//   }
//   const languages = monaco.languages.getLanguages()
//   const lang = languages.find((lang) => lang.extensions?.includes(`.${ext}`))
//   return !!lang
// }

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
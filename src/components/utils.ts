import * as monaco from "monaco-editor";
import {openPath, openUrl, revealItemInDir} from "@tauri-apps/plugin-opener";
import {
  faFileCode, faFileLines
} from '@fortawesome/free-solid-svg-icons'
import {FileViewType, FileViewTypeGroup, TreeItem} from "@/components/tree/tree.ts";
import {SEP} from "@/components/tree/tree.ts";

export const shellOpenPath = async (path?: string): Promise<void> => {
  if (!path) return
  return await openPath(path)
}

export const shellOpenUrl = async (path?: string): Promise<void> => {
  if (!path) return
  return await openUrl(path)
}

export const shellShowItemInFolder = async (path?: string) => {
  if (!path) return
  if (path.endsWith(SEP) && path.split(SEP).length <= 2) {
    return await openPath(path)
  }
  return await revealItemInDir(path)
}

export const getDateFormatter = (): Intl.DateTimeFormat => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

export const g_date_formatter = getDateFormatter()

export const toDate = (t: number | undefined): string => {
  if (t == undefined) {
    return ''
  }
  const date = new Date(Number(t) * 1000)
  const formatted = g_date_formatter.format(date)
  const arr = formatted.replace(/\s+/g, '').split('.')
  return arr.slice(0, 3).join('-') + ' ' + arr.slice(-1)[0]
}

export const formatFileSize = (bytes: number | undefined): string => {
  if (bytes == undefined) {
    return ''
  }
  if (bytes === 0) return '0KB'
  const kb = Math.ceil(bytes / 1024)
  return kb.toLocaleString('en-US') + 'KB'
}

export function isMonacoFile(ext?: string): boolean {
  if (!ext) {
    return false
  }
  const languages = monaco.languages.getLanguages()
  const lang = languages.find((lang) => lang.extensions?.includes(`.${ext}`))
  return !!lang
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

export function getFileViewIcon(fileViewType: FileViewType) {
  switch (fileViewType) {
    case "Monaco": return faFileCode
    default: return faFileLines
  }
}

export function getFileTypeGroup(treeItem?: TreeItem): FileViewTypeGroup {
  if(treeItem?.dir) {
    return 'Unknown'
  }
  let fileViewTypeGroup: FileViewTypeGroup
  const sz = treeItem?.sz || 0
  if (sz == 0) {
    fileViewTypeGroup = 'UnknownEmpty'
  } else if (['exe', 'com', 'msi', 'dll', 'zip'].includes(treeItem?.ext || '')) {
    fileViewTypeGroup = 'Binary'
  } else if (treeItem?.mt?.startsWith('image/')) {
    fileViewTypeGroup = 'Image'
  } else if (treeItem?.mt?.endsWith('/pdf')) {
    fileViewTypeGroup = 'Pdf'
  } else if (treeItem?.mt?.endsWith('/html')) {
    fileViewTypeGroup = 'Html'
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
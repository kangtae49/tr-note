import {openPath, openUrl, revealItemInDir} from "@tauri-apps/plugin-opener";
import {useRenderTreeFromPath, SEP} from "@/components/tree/tree.ts";
import {commands} from "@/bindings.ts";
import toast from "react-hot-toast";
import {useCallback} from "react";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {useFolderTreeStore} from "@/components/tree/stores/folderTreeStore.ts";

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

export function useSaveFile() {
  const duration = 1000;
  const folderTree = useFolderTreeStore((state) => state.folderTree)
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const {renderTreeFromPath} = useRenderTreeFromPath();

  const saveFile = useCallback(async (content: string) => {
    if (selectedItem == undefined) return;
    if(folderTree == undefined) return;

    const full_path = selectedItem.full_path;
    console.log("Saved code:", selectedItem.full_path);
    return commands.saveFile(full_path, content).then( async (res) => {
      if (res.status == "ok") {
        const item = res.data;
        console.log("save & renderTreeFromPath")
        await renderTreeFromPath(selectedItem.full_path)

        toast.success('Success saved', { duration });
        return selectedItem;
      } else {
        toast.success('Fail saved', { duration });
        return undefined;
      }
    }).catch(err => {
      console.log("Error saving code:", err);
      toast.error('Fail saved', { duration });
      return undefined;
    })
  }, [selectedItem]);

  return {saveFile};
}


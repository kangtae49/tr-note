import { create } from 'zustand'

export type MdPreviewType = 'live' | 'preview' | 'edit'

export interface MdPreviewTypeStore {
  mdPreviewType: MdPreviewType
  setMdPreviewType: (mdPreviewType: MdPreviewType) => void
}

export const useMdPreviewTypeStore = create<MdPreviewTypeStore>((set) => ({
  mdPreviewType: 'preview',
  setMdPreviewType: (mdPreviewType: MdPreviewType) => set(() => ({ mdPreviewType }))
}))

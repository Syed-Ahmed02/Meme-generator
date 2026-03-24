import { create } from "zustand"
import type { MemeTemplate, TextLayer } from "@/lib/types"

const MAX_HISTORY = 50

interface EditorStore {
  template: MemeTemplate | null
  layers: TextLayer[]
  selectedLayerId: string | null
  history: TextLayer[][]
  historyIndex: number

  setTemplate: (template: MemeTemplate) => void
  addLayer: (layer: TextLayer) => void
  updateLayer: (id: string, updates: Partial<TextLayer>) => void
  deleteLayer: (id: string) => void
  selectLayer: (id: string | null) => void
  setLayers: (layers: TextLayer[]) => void
  pushHistory: () => void
  undo: () => void
  redo: () => void
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  template: null,
  layers: [],
  selectedLayerId: null,
  history: [],
  historyIndex: -1,

  setTemplate: (template) => set({ template }),

  setLayers: (layers) => set({ layers }),

  addLayer: (layer) => {
    get().pushHistory()
    set((s) => ({ layers: [...s.layers, layer] }))
  },

  updateLayer: (id, updates) => {
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }))
  },

  deleteLayer: (id) => {
    get().pushHistory()
    set((s) => ({
      layers: s.layers.filter((l) => l.id !== id),
      selectedLayerId: s.selectedLayerId === id ? null : s.selectedLayerId,
    }))
  },

  selectLayer: (id) => set({ selectedLayerId: id }),

  pushHistory: () => {
    const { layers, history, historyIndex } = get()
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...layers.map((l) => ({ ...l }))])
    if (newHistory.length > MAX_HISTORY) newHistory.shift()
    set({
      history: newHistory,
      historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
    })
  },

  undo: () => {
    const { history, historyIndex, layers } = get()
    if (historyIndex < 0) return
    // Push current state as redo point if not already tracked
    const prev = history[historyIndex]
    if (!prev) return
    // Store current layers at next index if moving back
    const newHistory = [...history]
    if (historyIndex === newHistory.length - 1) {
      newHistory.push([...layers.map((l) => ({ ...l }))])
    }
    set({
      layers: prev.map((l) => ({ ...l })),
      historyIndex: historyIndex - 1,
      history: newHistory,
      selectedLayerId: null,
    })
  },

  redo: () => {
    const { history, historyIndex } = get()
    const next = history[historyIndex + 2]
    if (!next) return
    set({
      layers: next.map((l) => ({ ...l })),
      historyIndex: historyIndex + 1,
      selectedLayerId: null,
    })
  },
}))

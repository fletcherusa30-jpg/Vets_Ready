import { create } from "zustand"
import { TransitionChecklist, ChecklistItem } from "../types"

export type TransitionState = {
  checklist: TransitionChecklist | null
  setChecklist: (checklist: TransitionChecklist) => void
  toggleItem: (itemId: string) => void
  addItem: (item: ChecklistItem) => void
  removeItem: (itemId: string) => void
}

export const useTransitionStore = create<TransitionState>((set, get) => ({
  checklist: null,
  setChecklist: (checklist) => set({ checklist }),
  toggleItem: (itemId) => {
    const current = get().checklist
    if (!current) return
    const updated = {
      ...current,
      items: current.items.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item)),
    }
    updated.completedCount = updated.items.filter((i) => i.completed).length
    updated.progressPercent = Math.round((updated.completedCount / updated.items.length) * 100)
    set({ checklist: updated })
  },
  addItem: (item) => {
    const current = get().checklist
    if (!current) return
    const updated = { ...current, items: [...current.items, item] }
    updated.totalCount = updated.items.length
    set({ checklist: updated })
  },
  removeItem: (itemId) => {
    const current = get().checklist
    if (!current) return
    const updated = { ...current, items: current.items.filter((i) => i.id !== itemId) }
    updated.totalCount = updated.items.length
    set({ checklist: updated })
  },
}))

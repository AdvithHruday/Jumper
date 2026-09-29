'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { Inventory } from './match';

/**
 * The parts a student owns, kept in this browser (same approach as
 * `lib/progress/store.ts`: a no-op store on the server so prerendering never
 * reads a visitor's data).
 */

interface KitState {
  items: Inventory;
  /** Sets how many of an item the student has; 0 removes it. */
  setQty(id: string, qty: number): void;
  /** Replaces the whole inventory, e.g. with a starter-kit preset. */
  replace(items: Inventory): void;
  clear(): void;
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

function safeStorage(): StateStorage {
  return typeof window === 'undefined' ? noopStorage : window.localStorage;
}

export const useKit = create<KitState>()(
  persist(
    (set) => ({
      items: {},
      setQty: (id, qty) =>
        set((s) => {
          const items = { ...s.items };
          if (qty <= 0) delete items[id];
          else items[id] = Math.min(qty, 99);
          return { items };
        }),
      replace: (items) => set({ items: { ...items } }),
      clear: () => set({ items: {} }),
    }),
    { name: 'jumper.kit.v1', storage: createJSONStorage(() => safeStorage()) },
  ),
);

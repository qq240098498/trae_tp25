import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ParkingRecord, ParkingSpot } from '@/types';

interface ParkingState {
  records: ParkingRecord[];
  currentSpot: ParkingSpot | null;
  spotHistory: ParkingSpot[];

  addRecord: (data: Omit<ParkingRecord, 'id' | 'createdAt'>) => void;
  updateRecord: (id: string, data: Partial<ParkingRecord>) => void;
  deleteRecord: (id: string) => void;
  getRecord: (id: string) => ParkingRecord | undefined;

  setCurrentSpot: (spot: Omit<ParkingSpot, 'id' | 'createdAt' | 'isActive'>) => void;
  clearCurrentSpot: () => void;
}

const generateId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const useParkingStore = create<ParkingState>()(
  persist(
    (set, get) => ({
      records: [],
      currentSpot: null,
      spotHistory: [],

      addRecord: (data) => {
        const newRecord: ParkingRecord = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          records: [newRecord, ...state.records],
        }));
      },

      updateRecord: (id, data) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        }));
      },

      deleteRecord: (id) => {
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        }));
      },

      getRecord: (id) => {
        return get().records.find((r) => r.id === id);
      },

      setCurrentSpot: (spot) => {
        const existing = get().currentSpot;
        const newSpot: ParkingSpot = {
          ...spot,
          id: generateId(),
          createdAt: new Date().toISOString(),
          isActive: true,
        };
        const history = existing
          ? [{ ...existing, isActive: false }, ...get().spotHistory].slice(0, 20)
          : get().spotHistory;
        set({ currentSpot: newSpot, spotHistory: history });
      },

      clearCurrentSpot: () => {
        const existing = get().currentSpot;
        if (existing) {
          set((state) => ({
            currentSpot: null,
            spotHistory: [{ ...existing, isActive: false }, ...state.spotHistory].slice(0, 20),
          }));
        }
      },
    }),
    {
      name: 'parking-manager-storage',
      partialize: (state) => ({
        records: state.records,
        currentSpot: state.currentSpot,
        spotHistory: state.spotHistory,
      }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ParkingRecord, ParkingSpot } from '@/types';

interface ParkingState {
  records: ParkingRecord[];
  currentSpot: ParkingSpot | null;
  spotHistory: ParkingSpot[];
  activeReminders: string[];

  addRecord: (data: Omit<ParkingRecord, 'id' | 'createdAt'>) => void;
  updateRecord: (id: string, data: Partial<ParkingRecord>) => void;
  deleteRecord: (id: string) => void;
  getRecord: (id: string) => ParkingRecord | undefined;
  markReminderSent: (id: string) => void;
  markAsPaid: (id: string) => void;
  addActiveReminder: (id: string) => void;
  removeActiveReminder: (id: string) => void;
  getUnpaidRecords: () => ParkingRecord[];
  getRecordsNeedingReminder: () => ParkingRecord[];

  setCurrentSpot: (spot: Omit<ParkingSpot, 'id' | 'createdAt' | 'isActive'>) => void;
  clearCurrentSpot: () => void;
}

const generateId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const REMINDER_ADVANCE_MINUTES = 60;

export const useParkingStore = create<ParkingState>()(
  persist(
    (set, get) => ({
      records: [],
      currentSpot: null,
      spotHistory: [],
      activeReminders: [],

      addRecord: (data) => {
        const defaults = {
          isPrepaid: true,
          reminderEnabled: false,
          reminderSent: false,
          isPaid: true,
        };
        const newRecord: ParkingRecord = {
          ...defaults,
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
          activeReminders: state.activeReminders.filter((rid) => rid !== id),
        }));
      },

      getRecord: (id) => {
        return get().records.find((r) => r.id === id);
      },

      markReminderSent: (id) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, reminderSent: true } : r
          ),
        }));
      },

      markAsPaid: (id) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, isPaid: true, reminderSent: false } : r
          ),
          activeReminders: state.activeReminders.filter((rid) => rid !== id),
        }));
      },

      addActiveReminder: (id) => {
        set((state) => ({
          activeReminders: state.activeReminders.includes(id)
            ? state.activeReminders
            : [...state.activeReminders, id],
        }));
      },

      removeActiveReminder: (id) => {
        set((state) => ({
          activeReminders: state.activeReminders.filter((rid) => rid !== id),
        }));
      },

      getUnpaidRecords: () => {
        return get().records.filter((r) => !r.isPaid);
      },

      getRecordsNeedingReminder: () => {
        const now = new Date().getTime();
        return get().records.filter((r) => {
          if (r.isPaid || !r.reminderEnabled || r.reminderSent || !r.paymentDeadline) {
            return false;
          }
          const deadline = new Date(r.paymentDeadline).getTime();
          const reminderTime = deadline - REMINDER_ADVANCE_MINUTES * 60 * 1000;
          return now >= reminderTime && now < deadline;
        });
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
        activeReminders: state.activeReminders,
      }),
    }
  )
);

export { REMINDER_ADVANCE_MINUTES };

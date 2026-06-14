import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ParkingRecord, ParkingSpot, Coupon } from '@/types';

interface ParkingState {
  records: ParkingRecord[];
  currentSpot: ParkingSpot | null;
  spotHistory: ParkingSpot[];
  activeReminders: string[];
  coupons: Coupon[];

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

  addCoupon: (data: Omit<Coupon, 'id' | 'createdAt' | 'isUsed' | 'reminderSent'>) => void;
  updateCoupon: (id: string, data: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  getCoupon: (id: string) => Coupon | undefined;
  markCouponUsed: (couponId: string, recordId: string) => void;
  markCouponUnused: (couponId: string) => void;
  markCouponReminderSent: (id: string) => void;
  getAvailableCoupons: () => Coupon[];
  getCouponsNeedingReminder: () => Coupon[];
  getCouponByRecordId: (recordId: string) => Coupon | undefined;
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
      coupons: [],

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

      addCoupon: (data) => {
        const newCoupon: Coupon = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
          isUsed: false,
          reminderSent: false,
        };
        set((state) => ({
          coupons: [newCoupon, ...state.coupons],
        }));
      },

      updateCoupon: (id, data) => {
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        }));
      },

      deleteCoupon: (id) => {
        set((state) => ({
          coupons: state.coupons.filter((c) => c.id !== id),
        }));
      },

      getCoupon: (id) => {
        return get().coupons.find((c) => c.id === id);
      },

      markCouponUsed: (couponId, recordId) => {
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.id === couponId ? { ...c, isUsed: true, usedRecordId: recordId } : c
          ),
        }));
      },

      markCouponUnused: (couponId) => {
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.id === couponId ? { ...c, isUsed: false, usedRecordId: undefined } : c
          ),
        }));
      },

      markCouponReminderSent: (id) => {
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.id === id ? { ...c, reminderSent: true } : c
          ),
        }));
      },

      getAvailableCoupons: () => {
        const now = new Date().getTime();
        return get().coupons.filter((c) => {
          if (c.isUsed) return false;
          const validFrom = new Date(c.validFrom).getTime();
          const validTo = new Date(c.validTo).getTime() + 24 * 60 * 60 * 1000 - 1;
          return now >= validFrom && now <= validTo;
        });
      },

      getCouponsNeedingReminder: () => {
        const now = new Date().getTime();
        const threeDays = 3 * 24 * 60 * 60 * 1000;
        return get().coupons.filter((c) => {
          if (c.isUsed || c.reminderSent) return false;
          const validTo = new Date(c.validTo).getTime() + 24 * 60 * 60 * 1000 - 1;
          const diff = validTo - now;
          return diff > 0 && diff <= threeDays;
        });
      },

      getCouponByRecordId: (recordId) => {
        return get().coupons.find((c) => c.usedRecordId === recordId);
      },
    }),
    {
      name: 'parking-manager-storage',
      partialize: (state) => ({
        records: state.records,
        currentSpot: state.currentSpot,
        spotHistory: state.spotHistory,
        activeReminders: state.activeReminders,
        coupons: state.coupons,
      }),
    }
  )
);

export { REMINDER_ADVANCE_MINUTES };

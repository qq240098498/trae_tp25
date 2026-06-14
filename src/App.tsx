import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Records from '@/pages/Records';
import RecordForm from '@/pages/RecordForm';
import RecordDetail from '@/pages/RecordDetail';
import Statistics from '@/pages/Statistics';
import ParkingSpot from '@/pages/ParkingSpot';
import Coupons from '@/pages/Coupons';
import { useParkingStore } from '@/store/useParkingStore';
import { MOCK_RECORDS, MOCK_SPOT, MOCK_COUPONS } from '@/utils/mockData';
import PaymentReminderToast from '@/components/PaymentReminderToast';
import type { ParkingRecord, Coupon } from '@/types';

function AppRoutes() {
  const { records, currentSpot, coupons, addRecord, setCurrentSpot, addCoupon } = useParkingStore();

  useEffect(() => {
    if (records.length === 0) {
      MOCK_RECORDS.forEach((r) => {
        const { id, createdAt, ...rest } = r;
        void id;
        void createdAt;
        addRecord(rest as Omit<ParkingRecord, 'id' | 'createdAt'>);
      });
    }
    if (!currentSpot) {
      const { id, createdAt, isActive, ...rest } = MOCK_SPOT;
      void id;
      void createdAt;
      void isActive;
      setCurrentSpot(rest);
    }
    if (coupons.length === 0) {
      MOCK_COUPONS.forEach((c) => {
        const { id, createdAt, isUsed, reminderSent, ...rest } = c;
        void id;
        void createdAt;
        void isUsed;
        void reminderSent;
        addCoupon(rest as Omit<Coupon, 'id' | 'createdAt' | 'isUsed' | 'reminderSent'>);
      });
    }
  }, [addRecord, setCurrentSpot, addCoupon, records.length, currentSpot, coupons.length]);

  return (
    <Layout>
      <PaymentReminderToast />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/records" element={<Records />} />
        <Route path="/records/new" element={<RecordForm />} />
        <Route path="/records/:id" element={<RecordDetail />} />
        <Route path="/records/:id/edit" element={<RecordForm />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/parking-spot" element={<ParkingSpot />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

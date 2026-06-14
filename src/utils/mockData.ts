import type { ParkingRecord, ParkingSpot } from '@/types';

export const TODAY = new Date();
export const FORMAT_DATE = (d: Date) => d.toISOString().slice(0, 10);

function daysAgo(n: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return FORMAT_DATE(d);
}

function monthsAgoStart(n: number): string {
  const d = new Date(TODAY);
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  return FORMAT_DATE(d);
}

export const MOCK_RECORDS: ParkingRecord[] = [
  {
    id: 'r1',
    date: daysAgo(1),
    locationName: '公司楼下停车场',
    lat: 39.9087,
    lng: 116.3975,
    duration: 540,
    amount: 45,
    paymentMethod: 'app',
    notes: '早9点到晚6点',
    createdAt: new Date(TODAY.getTime() - 86400000).toISOString(),
  },
  {
    id: 'r2',
    date: daysAgo(2),
    locationName: '家附近小区外',
    lat: 39.9187,
    lng: 116.4075,
    duration: 720,
    amount: 25,
    paymentMethod: 'qrcode',
    createdAt: new Date(TODAY.getTime() - 2 * 86400000).toISOString(),
  },
  {
    id: 'r3',
    date: daysAgo(4),
    locationName: '朝阳大悦城',
    lat: 39.9287,
    lng: 116.5075,
    duration: 180,
    amount: 18,
    paymentMethod: 'cash',
    notes: '购物停车',
    createdAt: new Date(TODAY.getTime() - 4 * 86400000).toISOString(),
  },
  {
    id: 'r4',
    date: daysAgo(6),
    locationName: '公司楼下停车场',
    lat: 39.9087,
    lng: 116.3975,
    duration: 480,
    amount: 40,
    paymentMethod: 'app',
    createdAt: new Date(TODAY.getTime() - 6 * 86400000).toISOString(),
  },
  {
    id: 'r5',
    date: daysAgo(10),
    locationName: '公司楼下停车场',
    lat: 39.9087,
    lng: 116.3975,
    duration: 600,
    amount: 50,
    paymentMethod: 'app',
    createdAt: new Date(TODAY.getTime() - 10 * 86400000).toISOString(),
  },
  {
    id: 'r6',
    date: monthsAgoStart(1).slice(0, 8) + '15',
    locationName: '公司楼下停车场',
    lat: 39.9087,
    lng: 116.3975,
    duration: 540,
    amount: 48,
    paymentMethod: 'app',
    createdAt: new Date(TODAY.getTime() - 30 * 86400000).toISOString(),
  },
  {
    id: 'r7',
    date: monthsAgoStart(1).slice(0, 8) + '20',
    locationName: '家附近小区外',
    lat: 39.9187,
    lng: 116.4075,
    duration: 480,
    amount: 20,
    paymentMethod: 'qrcode',
    createdAt: new Date(TODAY.getTime() - 35 * 86400000).toISOString(),
  },
  {
    id: 'r8',
    date: monthsAgoStart(2).slice(0, 8) + '10',
    locationName: '公司楼下停车场',
    lat: 39.9087,
    lng: 116.3975,
    duration: 540,
    amount: 46,
    paymentMethod: 'app',
    createdAt: new Date(TODAY.getTime() - 60 * 86400000).toISOString(),
  },
  {
    id: 'r9',
    date: monthsAgoStart(3).slice(0, 8) + '05',
    locationName: '三里屯太古里',
    lat: 39.9387,
    lng: 116.4375,
    duration: 240,
    amount: 32,
    paymentMethod: 'qrcode',
    createdAt: new Date(TODAY.getTime() - 90 * 86400000).toISOString(),
  },
];

export const MOCK_SPOT: ParkingSpot = {
  id: 's1',
  spotNumber: 'B2-035',
  floor: 'B2',
  area: 'D区',
  photo: '',
  notes: '电梯口右转第3个',
  createdAt: new Date(TODAY.getTime() - 3600000).toISOString(),
  isActive: true,
};

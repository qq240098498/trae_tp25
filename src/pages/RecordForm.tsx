import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Wallet, CreditCard, Save, Calendar, Bell, BellOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useParkingStore } from '@/store/useParkingStore';
import { formatDuration, formatAmount, formatDateTime } from '@/utils/stats';
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from '@/types';
import { cn } from '@/lib/utils';
import LocationPickerModal from '@/components/LocationPickerModal';

export default function RecordForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit') && !!id;
  const { addRecord, updateRecord, getRecord } = useParkingStore();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('30');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('app');
  const [notes, setNotes] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [isPrepaid, setIsPrepaid] = useState(true);
  const [isPaid, setIsPaid] = useState(true);
  const [paymentDeadlineDate, setPaymentDeadlineDate] = useState('');
  const [paymentDeadlineTime, setPaymentDeadlineTime] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const record = getRecord(id!);
      if (record) {
        setDate(record.date);
        setLocationName(record.locationName);
        setLat(record.lat);
        setLng(record.lng);
        setHours(String(Math.floor(record.duration / 60)));
        setMinutes(String(record.duration % 60));
        setAmount(String(record.amount));
        setPaymentMethod(record.paymentMethod);
        setNotes(record.notes || '');
        setIsPrepaid(record.isPrepaid);
        setIsPaid(record.isPaid);
        setReminderEnabled(record.reminderEnabled);
        if (record.paymentDeadline) {
          const deadline = new Date(record.paymentDeadline);
          setPaymentDeadlineDate(deadline.toISOString().slice(0, 10));
          setPaymentDeadlineTime(
            `${String(deadline.getHours()).padStart(2, '0')}:${String(deadline.getMinutes()).padStart(2, '0')}`
          );
        }
      }
    }
  }, [isEdit, id, getRecord]);

  useEffect(() => {
    if (!isPrepaid && !paymentDeadlineDate && !paymentDeadlineTime) {
      const defaultDeadline = new Date();
      defaultDeadline.setHours(defaultDeadline.getHours() + 2);
      setPaymentDeadlineDate(defaultDeadline.toISOString().slice(0, 10));
      setPaymentDeadlineTime(
        `${String(defaultDeadline.getHours()).padStart(2, '0')}:${String(defaultDeadline.getMinutes()).padStart(2, '0')}`
      );
      setReminderEnabled(true);
    }
    if (isPrepaid) {
      setIsPaid(true);
    }
  }, [isPrepaid, isEdit, paymentDeadlineDate, paymentDeadlineTime]);

  const duration = parseInt(hours) * 60 + parseInt(minutes);
  const amountNum = parseFloat(amount) || 0;

  const getPaymentDeadlineISO = (): string | undefined => {
    if (isPrepaid || !paymentDeadlineDate || !paymentDeadlineTime) return undefined;
    return new Date(`${paymentDeadlineDate}T${paymentDeadlineTime}:00`).toISOString();
  };

  const canSubmit = locationName.trim() && duration > 0 && amountNum > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const data = {
      date,
      locationName: locationName.trim(),
      lat,
      lng,
      duration,
      amount: amountNum,
      paymentMethod,
      notes: notes.trim() || undefined,
      isPrepaid,
      isPaid: isPrepaid ? true : isPaid,
      paymentDeadline: getPaymentDeadlineISO(),
      reminderEnabled: !isPrepaid && reminderEnabled,
      reminderSent: false,
    };

    if (isEdit) {
      updateRecord(id!, data);
    } else {
      addRecord(data);
    }

    navigate('/records');
  };

  const handleLocationSelect = (loc: { name: string; lat: number; lng: number }) => {
    setLocationName(loc.name);
    setLat(loc.lat);
    setLng(loc.lng);
  };

  const paymentMethods: { value: PaymentMethod; icon: typeof Wallet; label: string }[] = [
    { value: 'cash', icon: Wallet, label: PAYMENT_METHOD_LABELS.cash },
    { value: 'qrcode', icon: CreditCard, label: PAYMENT_METHOD_LABELS.qrcode },
    { value: 'app', icon: CreditCard, label: PAYMENT_METHOD_LABELS.app },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white shadow-card flex items-center justify-center hover:shadow-card-hover transition-all text-neutral-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            {isEdit ? '编辑停车记录' : '新增停车记录'}
          </h2>
          <p className="text-sm text-neutral-500 mt-0.5">填写停车信息与费用</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-card p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-600" />
              停车日期
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent-500" />
              停车地点
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="输入地点名称"
                className="flex-1 px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="px-4 py-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-sm font-medium text-neutral-700 transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                地图选点
              </button>
            </div>
            {lat && lng && (
              <p className="text-xs text-neutral-500 mt-2">
                已选坐标：{lat.toFixed(4)}, {lng.toFixed(4)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              停车时长
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value || '0')}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm text-center"
                />
                <p className="text-xs text-neutral-500 text-center mt-1">小时</p>
              </div>
              <span className="text-neutral-400 font-medium">:</span>
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value || '0')}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm text-center"
                />
                <p className="text-xs text-neutral-500 text-center mt-1">分钟</p>
              </div>
              <div className="flex-1">
                <div className="px-4 py-3 rounded-xl bg-primary-50 text-center">
                  <span className="text-sm font-semibold text-primary-700">
                    {formatDuration(duration)}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 text-center mt-1">合计</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              缴费金额
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-neutral-400">¥</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-lg font-semibold"
              />
            </div>
            {amountNum > 0 && duration > 0 && (
              <p className="text-xs text-neutral-500 mt-2">
                每小时约 {formatAmount(amountNum / (duration / 60))}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              缴费方式
            </label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPaymentMethod(method.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all',
                    paymentMethod === method.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  )}
                >
                  <method.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{method.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              缴费类型
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPrepaid(true)}
                className={cn(
                  'flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all',
                  isPrepaid
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                )}
              >
                <CheckCircle2 className="w-6 h-6" />
                <div className="text-center">
                  <p className="text-sm font-semibold">预先缴费</p>
                  <p className="text-[10px] mt-0.5 opacity-70">出门前已缴清</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setIsPrepaid(false)}
                className={cn(
                  'flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all',
                  !isPrepaid
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                )}
              >
                <AlertCircle className="w-6 h-6" />
                <div className="text-center">
                  <p className="text-sm font-semibold">先停后缴</p>
                  <p className="text-[10px] mt-0.5 opacity-70">需设置缴费截止时间</p>
                </div>
              </button>
            </div>
          </div>

          {!isPrepaid && (
            <div className="space-y-4 p-4 rounded-xl bg-amber-50/50 border border-amber-200 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  缴费截止时间
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={paymentDeadlineDate}
                    onChange={(e) => setPaymentDeadlineDate(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm bg-white"
                  />
                  <input
                    type="time"
                    value={paymentDeadlineTime}
                    onChange={(e) => setPaymentDeadlineTime(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-sm bg-white"
                  />
                </div>
                {getPaymentDeadlineISO() && (
                  <p className="text-xs text-neutral-500 mt-2">
                    截止：{formatDateTime(getPaymentDeadlineISO()!)}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  {reminderEnabled ? (
                    <Bell className="w-5 h-5 text-amber-600" />
                  ) : (
                    <BellOff className="w-5 h-5 text-neutral-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-neutral-700">
                      到期前1小时提醒
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      避免忘记缴费产生滞纳金
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className={cn(
                    'relative w-12 h-7 rounded-full transition-colors',
                    reminderEnabled ? 'bg-amber-500' : 'bg-neutral-300'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all',
                      reminderEnabled ? 'left-6' : 'left-1'
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-amber-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={cn(
                    'w-5 h-5',
                    isPaid ? 'text-emerald-600' : 'text-neutral-400'
                  )} />
                  <div>
                    <p className="text-sm font-medium text-neutral-700">
                      是否已缴费
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {isPaid ? '已完成缴费' : '待缴费中'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPaid(!isPaid)}
                  className={cn(
                    'relative w-12 h-7 rounded-full transition-colors',
                    isPaid ? 'bg-emerald-500' : 'bg-neutral-300'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all',
                      isPaid ? 'left-6' : 'left-1'
                    )}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              备注（可选）
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="添加备注信息..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm resize-none"
            />
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 sm:bottom-6 z-30">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            'w-full py-3.5 rounded-2xl text-white font-semibold shadow-card hover:shadow-card-hover transition-all duration-200 flex items-center justify-center gap-2',
            canSubmit
              ? 'bg-gradient-to-r from-primary-700 to-primary-900 active:scale-[0.98]'
              : 'bg-neutral-300 cursor-not-allowed'
          )}
        >
          <Save className="w-5 h-5" />
          {isEdit ? '保存修改' : '保存记录'}
        </button>
      </div>

      <LocationPickerModal
        open={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onConfirm={handleLocationSelect}
        initialLat={lat || undefined}
        initialLng={lng || undefined}
      />
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Wallet, CreditCard, Save, Calendar, Bell, BellOff, AlertCircle, CheckCircle2, Ticket, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useParkingStore } from '@/store/useParkingStore';
import { formatDuration, formatAmount, formatDateTime, isCouponApplicable, calculateCouponDiscount } from '@/utils/stats';
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from '@/types';
import { cn } from '@/lib/utils';
import LocationPickerModal from '@/components/LocationPickerModal';

export default function RecordForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit') && !!id;
  const { addRecord, updateRecord, getRecord, getAvailableCoupons, getCoupon } = useParkingStore();

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

  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [showCouponPicker, setShowCouponPicker] = useState(false);

  const amountNum = parseFloat(amount) || 0;

  const availableCoupons = useMemo(() => {
    return getAvailableCoupons().map((coupon) => ({
      coupon,
      ...isCouponApplicable(coupon, amountNum, date),
    }));
  }, [getAvailableCoupons, amountNum, date]);

  const applicableCoupons = availableCoupons.filter((c) => c.applicable);

  const selectedCoupon = useMemo(() => {
    if (!selectedCouponId) return null;
    return getCoupon(selectedCouponId) || null;
  }, [selectedCouponId, getCoupon]);

  const couponDiscount = useMemo(() => {
    if (!selectedCoupon) return 0;
    const check = isCouponApplicable(selectedCoupon, amountNum, date);
    if (!check.applicable) return 0;
    return calculateCouponDiscount(selectedCoupon, amountNum);
  }, [selectedCoupon, amountNum, date]);

  const finalAmount = Math.max(0, amountNum - couponDiscount);

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
        if (record.couponId && record.originalAmount) {
          setAmount(String(record.originalAmount));
        } else {
          setAmount(String(record.amount));
        }
        setPaymentMethod(record.paymentMethod);
        setNotes(record.notes || '');
        setIsPrepaid(record.isPrepaid);
        setIsPaid(record.isPaid);
        setReminderEnabled(record.reminderEnabled);
        if (record.couponId) {
          setSelectedCouponId(record.couponId);
        }
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

  const getPaymentDeadlineISO = (): string | undefined => {
    if (isPrepaid || !paymentDeadlineDate || !paymentDeadlineTime) return undefined;
    return new Date(`${paymentDeadlineDate}T${paymentDeadlineTime}:00`).toISOString();
  };

  const canSubmit = locationName.trim() && duration > 0 && amountNum > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const recordData = {
      date,
      locationName: locationName.trim(),
      lat,
      lng,
      duration,
      amount: finalAmount,
      originalAmount: selectedCouponId ? amountNum : undefined,
      couponId: selectedCouponId || undefined,
      couponDiscount: selectedCouponId ? couponDiscount : undefined,
      paymentMethod,
      notes: notes.trim() || undefined,
      isPrepaid,
      isPaid: isPrepaid ? true : isPaid,
      paymentDeadline: getPaymentDeadlineISO(),
      reminderEnabled: !isPrepaid && reminderEnabled,
      reminderSent: false,
    };

    if (isEdit) {
      updateRecord(id!, recordData);
    } else {
      addRecord(recordData);
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
            <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-violet-500" />
              使用优惠券
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCouponPicker(!showCouponPicker)}
                disabled={availableCoupons.length === 0}
                className={cn(
                  'w-full px-4 py-3 rounded-xl border transition-all text-left flex items-center justify-between',
                  availableCoupons.length === 0
                    ? 'border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed'
                    : 'border-neutral-300 bg-white hover:border-violet-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none'
                )}
              >
                {selectedCoupon ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <Ticket className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {selectedCoupon.name}
                      </p>
                      <p className="text-xs text-violet-600 font-medium">
                        抵扣 {formatAmount(couponDiscount)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className={cn(
                    'text-sm',
                    availableCoupons.length === 0 ? 'text-neutral-400' : 'text-neutral-600'
                  )}>
                    {availableCoupons.length === 0
                      ? '暂无可使用的优惠券'
                      : applicableCoupons.length > 0
                        ? `${applicableCoupons.length} 张可用，点击选择`
                        : '点击查看优惠券'
                    }
                  </span>
                )}
                <div className="flex items-center gap-2">
                  {selectedCoupon && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCouponId(null);
                      }}
                      className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-red-100 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {showCouponPicker ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
              </button>

              {showCouponPicker && availableCoupons.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-neutral-200 shadow-lg z-20 overflow-hidden max-h-80 overflow-y-auto">
                  {availableCoupons.map(({ coupon, applicable, reason }) => (
                    <button
                      key={coupon.id}
                      type="button"
                      onClick={() => {
                        if (applicable) {
                          setSelectedCouponId(coupon.id);
                          setShowCouponPicker(false);
                        }
                      }}
                      disabled={!applicable}
                      className={cn(
                        'w-full px-4 py-3 text-left border-b border-neutral-100 last:border-b-0 transition-colors',
                        selectedCouponId === coupon.id
                          ? 'bg-violet-50'
                          : applicable
                            ? 'hover:bg-neutral-50'
                            : 'opacity-60 cursor-not-allowed bg-neutral-50'
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                            applicable ? 'bg-violet-100' : 'bg-neutral-200'
                          )}>
                            <Ticket className={cn(
                              'w-5 h-5',
                              applicable ? 'text-violet-600' : 'text-neutral-500'
                            )} />
                          </div>
                          <div className="min-w-0">
                            <p className={cn(
                              'text-sm font-semibold truncate',
                              applicable ? 'text-neutral-900' : 'text-neutral-500'
                            )}>
                              {coupon.name}
                            </p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {coupon.conditionDescription}
                            </p>
                            {!applicable && reason && (
                              <p className="text-xs text-red-500 mt-0.5">{reason}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={cn(
                            'text-lg font-bold',
                            applicable ? 'text-violet-600' : 'text-neutral-400'
                          )}>
                            -{formatAmount(coupon.faceValue)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCoupon && couponDiscount > 0 && (
              <div className="mt-3 p-4 rounded-xl bg-violet-50 border border-violet-200 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">原始金额</span>
                  <span className="text-sm text-neutral-900">{formatAmount(amountNum)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">优惠券抵扣</span>
                  <span className="text-sm font-medium text-violet-600">-{formatAmount(couponDiscount)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-violet-200">
                  <span className="text-sm font-semibold text-neutral-900">实付金额</span>
                  <span className="text-lg font-bold text-violet-700">{formatAmount(finalAmount)}</span>
                </div>
              </div>
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

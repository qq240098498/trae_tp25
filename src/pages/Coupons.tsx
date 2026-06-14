import { useState, useMemo } from 'react';
import {
  Plus,
  Ticket,
  Calendar,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit3,
  Trash2,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import { useParkingStore } from '@/store/useParkingStore';
import {
  formatAmount,
  formatDateRange,
  getCouponStatus,
  isCouponExpiringSoon,
  getDaysRemaining,
  generateConditionDescription,
} from '@/utils/stats';
import {
  COUPON_CONDITION_PRESETS,
  COUPON_CONDITION_LABELS,
  type Coupon,
  type CouponCondition,
  type CouponStatus,
} from '@/types';
import { cn } from '@/lib/utils';
import Empty from '@/components/Empty';

type FilterTab = 'all' | 'available' | 'used' | 'expired';

interface CouponFormData {
  name: string;
  faceValue: string;
  condition: CouponCondition;
  minAmount: string;
  conditionDescription: string;
  validFrom: string;
  validTo: string;
  notes: string;
}

const emptyFormData: CouponFormData = {
  name: '',
  faceValue: '',
  condition: 'none',
  minAmount: '',
  conditionDescription: '',
  validFrom: new Date().toISOString().slice(0, 10),
  validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  notes: '',
};

export default function Coupons() {
  const {
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    markCouponUsed,
    markCouponUnused,
  } = useParkingStore();

  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(emptyFormData);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showConditionOptions, setShowConditionOptions] = useState(false);

  const filteredCoupons = useMemo(() => {
    let result = coupons;

    if (filterTab !== 'all') {
      result = result.filter((c) => getCouponStatus(c) === filterTab);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.conditionDescription.toLowerCase().includes(query) ||
          (c.notes && c.notes.toLowerCase().includes(query))
      );
    }

    return result.sort((a, b) => {
      const statusA = getCouponStatus(a);
      const statusB = getCouponStatus(b);
      const priority: Record<CouponStatus, number> = {
        available: 0,
        used: 1,
        expired: 2,
      };
      if (priority[statusA] !== priority[statusB]) {
        return priority[statusA] - priority[statusB];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [coupons, filterTab, searchQuery]);

  const stats = useMemo(() => {
    const available = coupons.filter((c) => getCouponStatus(c) === 'available');
    const used = coupons.filter((c) => getCouponStatus(c) === 'used');
    const expired = coupons.filter((c) => getCouponStatus(c) === 'expired');
    const expiringSoon = available.filter((c) => isCouponExpiringSoon(c, 3));
    const totalFaceValue = available.reduce((sum, c) => sum + c.faceValue, 0);
    return { available, used, expired, expiringSoon, totalFaceValue };
  }, [coupons]);

  const openAddForm = () => {
    setEditingCoupon(null);
    setFormData(emptyFormData);
    setShowForm(true);
  };

  const openEditForm = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      name: coupon.name,
      faceValue: String(coupon.faceValue),
      condition: coupon.condition,
      minAmount: coupon.minAmount ? String(coupon.minAmount) : '',
      conditionDescription: coupon.conditionDescription,
      validFrom: coupon.validFrom,
      validTo: coupon.validTo,
      notes: coupon.notes || '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCoupon(null);
    setFormData(emptyFormData);
  };

  const handleConditionSelect = (condition: CouponCondition) => {
    setFormData((prev) => ({
      ...prev,
      condition,
      conditionDescription: generateConditionDescription(
        condition,
        condition === 'min_amount' ? parseFloat(prev.minAmount) || 0 : undefined
      ),
    }));
    setShowConditionOptions(false);
  };

  const updateConditionDescription = () => {
    setFormData((prev) => ({
      ...prev,
      conditionDescription: generateConditionDescription(
        prev.condition,
        prev.condition === 'min_amount' ? parseFloat(prev.minAmount) || 0 : undefined
      ),
    }));
  };

  const canSubmit = useMemo(() => {
    const faceValue = parseFloat(formData.faceValue);
    return (
      formData.name.trim() &&
      !isNaN(faceValue) &&
      faceValue > 0 &&
      formData.validFrom &&
      formData.validTo &&
      formData.validFrom <= formData.validTo
    );
  }, [formData]);

  const handleSubmit = () => {
    if (!canSubmit) return;

    const data = {
      name: formData.name.trim(),
      faceValue: parseFloat(formData.faceValue),
      condition: formData.condition,
      minAmount:
        formData.condition === 'min_amount' && formData.minAmount
          ? parseFloat(formData.minAmount)
          : undefined,
      conditionDescription:
        formData.conditionDescription.trim() ||
        generateConditionDescription(
          formData.condition,
          formData.condition === 'min_amount'
            ? parseFloat(formData.minAmount) || 0
            : undefined
        ),
      validFrom: formData.validFrom,
      validTo: formData.validTo,
      notes: formData.notes.trim() || undefined,
    };

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, data);
    } else {
      addCoupon(data);
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    deleteCoupon(id);
    setDeleteConfirmId(null);
  };

  const handleToggleUsed = (coupon: Coupon) => {
    if (coupon.isUsed) {
      markCouponUnused(coupon.id);
    } else {
      markCouponUsed(coupon.id, '');
    }
  };

  const getStatusBadge = (coupon: Coupon) => {
    const status = getCouponStatus(coupon);
    switch (status) {
      case 'available':
        if (isCouponExpiringSoon(coupon, 3)) {
          return {
            icon: AlertTriangle,
            label: `即将过期(${getDaysRemaining(coupon.validTo)}天)`,
            className: 'bg-orange-50 text-orange-600 border-orange-200',
          };
        }
        return {
          icon: Sparkles,
          label: '可使用',
          className: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        };
      case 'used':
        return {
          icon: CheckCircle2,
          label: '已使用',
          className: 'bg-neutral-50 text-neutral-500 border-neutral-200',
        };
      case 'expired':
        return {
          icon: XCircle,
          label: '已过期',
          className: 'bg-red-50 text-red-500 border-red-200',
        };
    }
  };

  const filterTabs: { value: FilterTab; label: string; count: number }[] = [
    { value: 'all', label: '全部', count: coupons.length },
    { value: 'available', label: '可用', count: stats.available.length },
    { value: 'used', label: '已使用', count: stats.used.length },
    { value: 'expired', label: '已过期', count: stats.expired.length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">优惠券管理</h2>
          <p className="text-sm text-neutral-500 mt-1">
            共 {coupons.length} 张 · 可用面额总值 {formatAmount(stats.totalFaceValue)}
            {stats.expiringSoon.length > 0 && (
              <span className="ml-2 text-orange-600 font-medium">
                · {stats.expiringSoon.length} 张即将过期
              </span>
            )}
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:shadow-card-hover transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          添加优惠券
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-violet-500 to-violet-700 rounded-2xl p-4 text-white shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="w-4 h-4 text-white/80" />
            <span className="text-xs text-white/80">可用优惠券</span>
          </div>
          <p className="text-2xl font-bold">{stats.available.length}</p>
          <p className="text-xs text-white/70 mt-1">面额 {formatAmount(stats.totalFaceValue)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-4 text-white shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-white/80" />
            <span className="text-xs text-white/80">即将过期</span>
          </div>
          <p className="text-2xl font-bold">{stats.expiringSoon.length}</p>
          <p className="text-xs text-white/70 mt-1">3天内到期</p>
        </div>
        <div className="bg-gradient-to-br from-neutral-500 to-neutral-700 rounded-2xl p-4 text-white shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-white/80" />
            <span className="text-xs text-white/80">已使用</span>
          </div>
          <p className="text-2xl font-bold">{stats.used.length}</p>
          <p className="text-xs text-white/70 mt-1">累计节省 {formatAmount(stats.used.reduce((s, c) => s + c.faceValue, 0))}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-4 text-white shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-white/80" />
            <span className="text-xs text-white/80">已过期</span>
          </div>
          <p className="text-2xl font-bold">{stats.expired.length}</p>
          <p className="text-xs text-white/70 mt-1">浪费面额 {formatAmount(stats.expired.reduce((s, c) => s + c.faceValue, 0))}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterTab(tab.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border',
              filterTab === tab.value
                ? 'bg-violet-600 text-white border-violet-600 shadow-card'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-violet-300 hover:text-violet-700'
            )}
          >
            <Filter className="w-4 h-4" />
            {tab.label}
            <span className={cn(
              'px-1.5 py-0.5 rounded-md text-[10px] font-semibold',
              filterTab === tab.value ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索优惠券名称或备注..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm bg-white"
        />
      </div>

      {filteredCoupons.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card py-16">
          <Empty />
          <p className="text-center text-neutral-500 mt-4">暂无优惠券</p>
          <div className="text-center mt-4">
            <button
              onClick={openAddForm}
              className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              添加第一张优惠券
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCoupons.map((coupon, index) => {
            const statusBadge = getStatusBadge(coupon);
            const status = getCouponStatus(coupon);
            return (
              <div
                key={coupon.id}
                className={cn(
                  'relative overflow-hidden rounded-2xl shadow-card transition-all duration-300 animate-slide-up group',
                  status === 'expired' && 'opacity-60',
                  status === 'used' && 'opacity-75'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  'absolute top-0 left-0 w-3 h-full',
                  status === 'available' ? 'bg-gradient-to-b from-violet-500 to-violet-700' :
                  status === 'used' ? 'bg-gradient-to-b from-neutral-400 to-neutral-600' :
                  'bg-gradient-to-b from-red-400 to-red-600'
                )} />

                <div className="bg-white p-5 pl-7">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-neutral-900 truncate">
                          {coupon.name}
                        </h3>
                        {statusBadge && (
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border flex-shrink-0',
                            statusBadge.className
                          )}>
                            <statusBadge.icon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                        )}
                      </div>
                      <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-violet-600 to-violet-800 bg-clip-text text-transparent">
                        {formatAmount(coupon.faceValue)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditForm(coupon)}
                        className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-violet-100 flex items-center justify-center text-neutral-500 hover:text-violet-700 transition-colors"
                        title="编辑"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(coupon.id)}
                        className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-red-100 flex items-center justify-center text-neutral-500 hover:text-red-600 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="w-4 h-4 text-violet-500 flex-shrink-0" />
                      <span className="text-neutral-600">{coupon.conditionDescription}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-violet-500 flex-shrink-0" />
                      <span className="text-neutral-600">{formatDateRange(coupon.validFrom, coupon.validTo)}</span>
                    </div>
                    {status === 'available' && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span className={cn(
                          isCouponExpiringSoon(coupon, 3) ? 'text-orange-600 font-medium' : 'text-neutral-500'
                        )}>
                          剩余 {getDaysRemaining(coupon.validTo)} 天
                        </span>
                      </div>
                    )}
                  </div>

                  {coupon.notes && (
                    <p className="mt-3 text-xs text-neutral-400 border-t border-neutral-100 pt-3">
                      {coupon.notes}
                    </p>
                  )}

                  {status === 'available' && (
                    <div className="mt-4 pt-3 border-t border-neutral-100">
                      <button
                        onClick={() => handleToggleUsed(coupon)}
                        className="w-full py-2 rounded-xl bg-violet-50 text-violet-700 text-sm font-medium hover:bg-violet-100 transition-colors"
                      >
                        标记为已使用
                      </button>
                    </div>
                  )}
                  {status === 'used' && (
                    <div className="mt-4 pt-3 border-t border-neutral-100">
                      <button
                        onClick={() => handleToggleUsed(coupon)}
                        className="w-full py-2 rounded-xl bg-neutral-50 text-neutral-600 text-sm font-medium hover:bg-neutral-100 transition-colors"
                      >
                        撤销使用标记
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-900">
                {editingCoupon ? '编辑优惠券' : '添加优惠券'}
              </h3>
              <button
                onClick={closeForm}
                className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  优惠券名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：商场停车券、工作日满减券"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  面额（元）
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-neutral-400">¥</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.faceValue}
                    onChange={(e) => setFormData({ ...formData, faceValue: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-lg font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  使用条件
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowConditionOptions(!showConditionOptions)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm bg-white flex items-center justify-between"
                  >
                    <span className="font-medium text-neutral-700">
                      {COUPON_CONDITION_LABELS[formData.condition]}
                    </span>
                    {showConditionOptions ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>
                  {showConditionOptions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-neutral-200 shadow-lg z-10 overflow-hidden">
                      {COUPON_CONDITION_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => handleConditionSelect(preset.value)}
                          className={cn(
                            'w-full px-4 py-3 text-left hover:bg-violet-50 transition-colors border-b border-neutral-100 last:border-b-0',
                            formData.condition === preset.value && 'bg-violet-50'
                          )}
                        >
                          <p className="text-sm font-medium text-neutral-900">{preset.label}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">{preset.desc}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {formData.condition === 'min_amount' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      最低消费金额（元）
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-neutral-400">¥</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.minAmount}
                        onChange={(e) => {
                          setFormData({ ...formData, minAmount: e.target.value });
                        }}
                        onBlur={updateConditionDescription}
                        placeholder="30.00"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    条件描述（可选，自动生成）
                  </label>
                  <input
                    type="text"
                    value={formData.conditionDescription}
                    onChange={(e) => setFormData({ ...formData, conditionDescription: e.target.value })}
                    placeholder="例如：满30减10、仅限周末使用"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    生效日期
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    到期日期
                  </label>
                  <input
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm bg-white"
                  />
                </div>
              </div>
              {formData.validFrom && formData.validTo && formData.validFrom > formData.validTo && (
                <p className="text-xs text-red-600 -mt-3">生效日期不能晚于到期日期</p>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  备注（可选）
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="添加备注信息..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-neutral-100 bg-neutral-50">
              <button
                onClick={closeForm}
                className="flex-1 px-4 py-3 rounded-xl border border-neutral-300 text-neutral-700 font-medium text-sm hover:bg-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl text-white font-medium text-sm transition-colors flex items-center justify-center gap-2',
                  canSubmit
                    ? 'bg-gradient-to-r from-violet-600 to-violet-800 hover:shadow-card-hover active:scale-[0.98]'
                    : 'bg-neutral-300 cursor-not-allowed'
                )}
              >
                <Save className="w-4 h-4" />
                {editingCoupon ? '保存修改' : '添加优惠券'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-scale-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">确认删除</h3>
              <p className="text-sm text-neutral-500 mt-2">
                确定要删除这张优惠券吗？此操作无法撤销。
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-medium text-sm hover:bg-neutral-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

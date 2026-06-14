import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  CarFront,
  MapPin,
  Upload,
  Save,
  X,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  History,
  Trash2,
  Eye,
  Navigation,
  Map as MapIcon,
  Sparkles,
} from 'lucide-react';
import { useParkingStore } from '@/store/useParkingStore';
import { formatDate } from '@/utils/stats';
import { cn } from '@/lib/utils';
import Empty from '@/components/Empty';
import LocationPickerModal from '@/components/LocationPickerModal';
import {
  openWalkingNavigation,
  hasCoordinates,
  INDOOR_DESCRIPTION_TIPS,
} from '@/utils/navigation';

export default function ParkingSpot() {
  const navigate = useNavigate();
  const { currentSpot, spotHistory, setCurrentSpot, clearCurrentSpot } = useParkingStore();

  const [spotNumber, setSpotNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [area, setArea] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [indoorDescription, setIndoorDescription] = useState('');
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showIndoorTips, setShowIndoorTips] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentSpot) {
      setSpotNumber(currentSpot.spotNumber);
      setFloor(currentSpot.floor || '');
      setArea(currentSpot.area || '');
      setNotes(currentSpot.notes || '');
      setPhoto(currentSpot.photo || '');
      setLat(currentSpot.lat ?? null);
      setLng(currentSpot.lng ?? null);
      setIndoorDescription(currentSpot.indoorDescription || '');
    }
  }, [currentSpot]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (result.length > 2 * 1024 * 1024) {
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setPhoto(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = result;
      } else {
        setPhoto(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!spotNumber.trim()) return;

    setCurrentSpot({
      spotNumber: spotNumber.trim(),
      floor: floor.trim() || undefined,
      area: area.trim() || undefined,
      photo: photo || undefined,
      notes: notes.trim() || undefined,
      lat: lat ?? undefined,
      lng: lng ?? undefined,
      indoorDescription: indoorDescription.trim() || undefined,
    });
  };

  const handleNavigate = () => {
    if (!hasCoordinates(lat, lng)) return;
    const spotName = `${spotNumber}车位${floor ? ` · ${floor}` : ''}`;
    openWalkingNavigation({
      lat: lat!,
      lng: lng!,
      name: spotName,
    });
  };

  const handleLocationSelect = (loc: { name: string; lat: number; lng: number }) => {
    setLat(loc.lat);
    setLng(loc.lng);
  };

  const handleIndoorTipClick = (tip: string) => {
    if (indoorDescription.includes(tip)) return;
    setIndoorDescription((prev) => (prev ? `${prev}、${tip}` : tip));
    setShowIndoorTips(false);
  };

  const handleClear = () => {
    clearCurrentSpot();
    setSpotNumber('');
    setFloor('');
    setArea('');
    setNotes('');
    setPhoto('');
    setLat(null);
    setLng(null);
    setIndoorDescription('');
  };

  const openPreview = (p: string) => {
    setPreviewPhoto(p);
    setShowPhotoPreview(true);
  };

  const canSave = spotNumber.trim().length > 0;

  const formatTime = (isoStr: string) => {
    const d = new Date(isoStr);
    return `${formatDate(isoStr)} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white shadow-card flex items-center justify-center hover:shadow-card-hover transition-all text-neutral-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">车位记录</h2>
            <p className="text-sm text-neutral-500 mt-0.5">拍照记录方便取车</p>
          </div>
        </div>
        {spotHistory.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
              showHistory
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white shadow-card hover:shadow-card-hover text-neutral-600'
            )}
          >
            <History className="w-4 h-4" />
            历史
          </button>
        )}
      </div>

      {currentSpot && (
        <div className="bg-gradient-to-br from-violet-600 to-violet-900 rounded-2xl p-6 text-white shadow-card animate-slide-up">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <CarFront className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white/70">当前车位</p>
                  <span className="inline-flex items-center gap-1 bg-emerald-400/20 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    已记录
                  </span>
                </div>
                <p className="text-3xl font-bold mt-1 tracking-wide truncate">{currentSpot.spotNumber}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-white/70 flex-wrap">
                  {currentSpot.floor && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {currentSpot.floor}
                    </span>
                  )}
                  {currentSpot.area && <span>{currentSpot.area}</span>}
                </div>
                {currentSpot.indoorDescription && (
                  <p className="text-xs text-white/80 mt-2 bg-white/10 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {currentSpot.indoorDescription}
                  </p>
                )}
                {currentSpot.notes && (
                  <p className="text-xs text-white/60 mt-2">📝 {currentSpot.notes}</p>
                )}
                <p className="text-[11px] text-white/50 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  记录于 {formatTime(currentSpot.createdAt)}
                </p>
              </div>
            </div>
            {currentSpot.photo && (
              <button
                onClick={() => openPreview(currentSpot.photo!)}
                className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white/30 hover:border-white/60 transition-all flex-shrink-0 bg-black/20 ml-4"
              >
                <img src={currentSpot.photo} alt="车位照片" className="w-full h-full object-cover" />
              </button>
            )}
          </div>

          <div className="mt-5 pt-5 border-t border-white/20 flex gap-3">
            {hasCoordinates(currentSpot.lat, currentSpot.lng) ? (
              <button
                onClick={handleNavigate}
                className="flex-1 py-2.5 rounded-xl bg-white text-violet-700 font-semibold text-sm hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Navigation className="w-4 h-4" />
                带我找车
              </button>
            ) : (
              <div className="flex-1 py-2.5 rounded-xl bg-white/20 text-white/60 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                <MapIcon className="w-4 h-4" />
                未设置位置
              </div>
            )}
            <button
              onClick={() => navigate('/parking-spot')}
              className="px-4 py-2.5 rounded-xl bg-white/20 text-white font-medium text-sm hover:bg-white/30 transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              查看详情
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card p-5 space-y-5 animate-slide-up">
        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
          <CarFront className="w-4 h-4 text-violet-600" />
          {currentSpot ? '更新车位信息' : '记录新车位'}
        </h3>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            车位编号 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={spotNumber}
            onChange={(e) => setSpotNumber(e.target.value)}
            placeholder="如：B2-035"
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-lg font-semibold tracking-wider"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">楼层</label>
            <input
              type="text"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="如：B2、F3"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">区域</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="如：D区、东区"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-600" />
            停车位置（导航用）
          </label>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-3 rounded-xl border border-neutral-300 bg-neutral-50 text-sm text-neutral-600 flex items-center gap-2 overflow-hidden">
              <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <span className="truncate">
                {lat && lng
                  ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
                  : '未设置位置坐标'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowLocationPicker(true)}
              className="px-4 py-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-sm font-medium text-neutral-700 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <MapIcon className="w-4 h-4" />
              地图选点
            </button>
          </div>
          {lat && lng && (
            <button
              type="button"
              onClick={() => {
                setLat(null);
                setLng(null);
              }}
              className="text-xs text-neutral-500 hover:text-red-500 mt-1.5 transition-colors"
            >
              清除位置
            </button>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            室内定位描述
            <span className="text-xs font-normal text-neutral-400">
              帮助快速找到车位
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={indoorDescription}
              onChange={(e) => setIndoorDescription(e.target.value)}
              placeholder="如：电梯口附近、蓝色柱子旁"
              className="w-full px-4 py-3 pr-10 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowIndoorTips(!showIndoorTips)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center hover:bg-amber-100 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          {showIndoorTips && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-neutral-200 p-3 z-20 animate-scale-in">
              <p className="text-xs text-neutral-500 mb-2">快速添加描述：</p>
              <div className="flex flex-wrap gap-2">
                {INDOOR_DESCRIPTION_TIPS.map((tip) => (
                  <button
                    key={tip}
                    type="button"
                    onClick={() => handleIndoorTipClick(tip)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      indoorDescription.includes(tip)
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-amber-50 hover:text-amber-600'
                    )}
                  >
                    + {tip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            车位照片
          </label>
          {photo ? (
            <div className="relative">
              <button
                onClick={() => openPreview(photo)}
                className="w-full h-48 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 hover:border-primary-300 transition-all"
              >
                <img src={photo} alt="车位照片预览" className="w-full h-full object-cover" />
              </button>
              <button
                onClick={() => setPhoto('')}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed border-neutral-300 hover:border-violet-400 hover:bg-violet-50 transition-all text-neutral-500 hover:text-violet-600"
              >
                <Camera className="w-8 h-8" />
                <span className="text-sm font-medium">拍照</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed border-neutral-300 hover:border-primary-400 hover:bg-primary-50 transition-all text-neutral-500 hover:text-primary-600"
              >
                <Upload className="w-8 h-8" />
                <span className="text-sm font-medium">从相册选择</span>
              </button>
            </div>
          )}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">备注</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="如：电梯口右转第3个、靠近柱子..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        {currentSpot && (
          <button
            onClick={handleClear}
            className="px-4 py-3.5 rounded-2xl border border-neutral-300 text-neutral-600 font-semibold hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            取车清除
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={cn(
            'flex-1 py-3.5 rounded-2xl text-white font-semibold shadow-card hover:shadow-card-hover transition-all duration-200 flex items-center justify-center gap-2',
            canSave
              ? 'bg-gradient-to-r from-violet-600 to-violet-900 active:scale-[0.98]'
              : 'bg-neutral-300 cursor-not-allowed'
          )}
        >
          <Save className="w-5 h-5" />
          {currentSpot ? '更新记录' : '保存车位'}
        </button>
      </div>

      {showHistory && spotHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-5 animate-slide-up">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-neutral-500" />
            历史车位记录
          </h3>
          <div className="space-y-3">
            {spotHistory.map((spot, index) => (
              <div
                key={spot.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors animate-slide-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {spot.photo ? (
                  <button
                    onClick={() => openPreview(spot.photo!)}
                    className="w-14 h-14 rounded-lg overflow-hidden border border-neutral-200 flex-shrink-0 bg-neutral-200"
                  >
                    <img src={spot.photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-neutral-200 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-6 h-6 text-neutral-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-neutral-900 tracking-wide">
                      {spot.spotNumber}
                    </p>
                    {!spot.isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-500">
                        已取车
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
                    {spot.floor && <span>{spot.floor}</span>}
                    {spot.area && <span>· {spot.area}</span>}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {formatTime(spot.createdAt)}
                  </p>
                </div>
                {spot.photo && (
                  <button
                    onClick={() => openPreview(spot.photo!)}
                    className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-neutral-500 hover:text-primary-600 hover:shadow transition-all flex-shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!currentSpot && spotHistory.length === 0 && (
        <div className="bg-white rounded-2xl shadow-card py-12">
          <Empty />
          <p className="text-center text-neutral-500 mt-4">还没有记录车位</p>
          <p className="text-center text-xs text-neutral-400 mt-1">
            停车后记得记录车位号，取车更方便
          </p>
        </div>
      )}

      {showPhotoPreview && previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fade-in"
          onClick={() => setShowPhotoPreview(false)}
        >
          <button
            onClick={() => setShowPhotoPreview(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewPhoto}
            alt="车位照片"
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

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

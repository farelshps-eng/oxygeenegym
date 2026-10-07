import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Trash2, Copy, Check, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MediaItem } from '../../types';
import { api } from '../../services/api';

export const AdminMedia: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<{ id: number; message: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await api.getMedia();
      setMediaList(data);
    } catch {
      showToast('فشل تحميل مكتبة الوسائط', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await api.uploadMedia(file);
      showToast('تم رفع الصورة بنجاح');
      loadMedia();
    } catch (err: any) {
      showToast(err.message || 'فشل رفع الصورة', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCopy = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('تم نسخ رابط الصورة');
  };

  const handleDelete = async (id: number, force: boolean = false) => {
    try {
      await api.deleteMedia(id, force);
      showToast('تم حذف الصورة بنجاح');
      setDeleteWarning(null);
      loadMedia();
    } catch (err: any) {
      if (err.message && err.message.includes('مستخدمة')) {
        setDeleteWarning({ id, message: err.message });
      } else {
        showToast(err.message || 'فشل حذف الصورة', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-red-500" />
            <span>مكتبة الصور والوسائط</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            رفع وإدارة وإعادة استخدام الصور لمعدات الجيم والمرافق والأخبار
          </p>
        </div>

        <label className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-red-950/40 flex items-center gap-2 cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'جاري الرفع...' : 'رفع صورة جديدة'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {toast && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400'
              : 'bg-red-950/60 border border-red-800 text-red-400'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Warning for in-use image */}
      {deleteWarning && (
        <div className="p-4 bg-yellow-950/40 border border-yellow-800/80 rounded-xl text-xs text-yellow-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
            <span>{deleteWarning.message}</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setDeleteWarning(null)}
              className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs"
            >
              إلغاء
            </button>
            <button
              onClick={() => handleDelete(deleteWarning.id, true)}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs"
            >
              تأكيد الحذف القسري
            </button>
          </div>
        </div>
      )}

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-20 text-neutral-500">جاري تحميل الوسائط...</div>
      ) : mediaList.length === 0 ? (
        <div className="text-center py-20 bg-[#0f0f13] border border-neutral-800 rounded-2xl p-8 space-y-3">
          <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">لا توجد وسائط مرفوعة بعد</h3>
          <p className="text-xs text-neutral-400">
            انقر على زر "رفع صورة جديدة" أعلاه لإضافة صور إلى المكتبة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaList.map((item) => (
            <div
              key={item.id}
              className="group bg-[#0f0f13] border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between"
            >
              <div className="aspect-square bg-neutral-950 relative overflow-hidden">
                <img
                  src={item.url}
                  alt={item.original_name || item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    onClick={() => handleCopy(item.url, item.id)}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
                    title="نسخ رابط الصورة"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-red-950 hover:bg-red-800 text-red-300 hover:text-white cursor-pointer"
                    title="حذف الصورة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 text-start">
                <p className="text-xs font-semibold text-white truncate" title={item.original_name || item.filename}>
                  {item.original_name || item.filename}
                </p>
                <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono mt-1">
                  <span>{item.size ? `${Math.round(item.size / 1024)} KB` : 'ملف'}</span>
                  <button
                    onClick={() => handleCopy(item.url, item.id)}
                    className="text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    نسخ الرابط
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

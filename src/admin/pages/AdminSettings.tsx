import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle, MapPin, Phone, Building, Sparkles } from 'lucide-react';
import { SiteSettings } from '../../types';
import { api } from '../../services/api';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSiteSettings();
      setSettings(data);
    } catch {
      showToast('فشل تحميل إعدادات الموقع', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSiteSettings(settings);
      showToast('تم حفظ إعدادات الموقع بنجاح');
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-neutral-500">جاري تحميل إعدادات الموقع...</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-red-500" />
            <span>إعدادات الموقع والنادي</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            تعديل بيانات أوكسجين جيم، الموقع، معلومات التواصل، ونصوص الواجهة
          </p>
        </div>
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

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* 1. General Info */}
        <div className="bg-[#0f0f13] border border-neutral-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Building className="w-4 h-4 text-red-500" />
            <span>المعلومات الأساسية والهوية</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">اسم الجيم بالإنجليزية</label>
              <input
                type="text"
                value={settings.gym_name || ''}
                onChange={(e) => handleChange('gym_name', e.target.value)}
                placeholder="OXYGEN GYM"
                className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">اسم الجيم بالعربية</label>
              <input
                type="text"
                value={settings.gym_name_ar || ''}
                onChange={(e) => handleChange('gym_name_ar', e.target.value)}
                placeholder="أوكسجين جيم"
                className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">وصف النادي التعريفي</label>
            <textarea
              rows={2}
              value={settings.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="وصف مختصر يظهر في محركات البحث وتذييل الصفحة..."
              className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 resize-none"
            />
          </div>
        </div>

        {/* 2. Location & Map Settings */}
        <div className="bg-[#0f0f13] border border-neutral-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>بيانات الموقع والخرائط (طرابلس، ليبيا)</span>
          </h3>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">العنوان الفعلي</label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="طريق عين زارة، طرابلس، ليبيا"
              className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Google Maps Plus Code *
              </label>
              <input
                type="text"
                value={settings.plus_code || ''}
                onChange={(e) => handleChange('plus_code', e.target.value)}
                placeholder="R84G+X2P"
                className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-mono font-bold text-red-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">رابط Google Maps المباشر</label>
              <input
                type="url"
                value={settings.google_maps_url || ''}
                onChange={(e) => handleChange('google_maps_url', e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 3. Contact Info */}
        <div className="bg-[#0f0f13] border border-neutral-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Phone className="w-4 h-4 text-red-500" />
            <span>بيانات التواصل والاستقبال</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">رقم الهاتف الرسمي</label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+218 91 123 4567"
                className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">رقم الواتساب</label>
              <input
                type="text"
                value={settings.whatsapp || ''}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="+218 91 123 4567"
                className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="info@oxygengym.ly"
                className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. Homepage Hero texts */}
        <div className="bg-[#0f0f13] border border-neutral-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span>نصوص الواجهة الرئيسية (Hero Section)</span>
          </h3>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">العنوان الرئيسي (Headline)</label>
            <input
              type="text"
              value={settings.hero_title || ''}
              onChange={(e) => handleChange('hero_title', e.target.value)}
              placeholder="تنفّس القوة. اصنع الفرق."
              className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">النص المساعد (Supporting Text)</label>
            <textarea
              rows={2}
              value={settings.hero_description || ''}
              onChange={(e) => handleChange('hero_description', e.target.value)}
              placeholder="كل ما تحتاجه لتدريب أقوى، لياقة أفضل، ورحلة مستمرة نحو أهدافك."
              className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">رابط صورة الواجهة (Hero Image URL)</label>
            <input
              type="text"
              value={settings.hero_image || ''}
              onChange={(e) => handleChange('hero_image', e.target.value)}
              placeholder="/images/hero.svg"
              className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-mono"
            />
          </div>
        </div>

        {/* 5. About Section & Statistics */}
        <div className="bg-[#0f0f13] border border-neutral-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Building className="w-4 h-4 text-red-500" />
            <span>قسم "عن OXYGEN GYM" والإحصائيات</span>
          </h3>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">عنوان القسم</label>
            <input
              type="text"
              value={settings.about_title || ''}
              onChange={(e) => handleChange('about_title', e.target.value)}
              placeholder="عن OXYGEN GYM"
              className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">النص التعريفي بالنادي</label>
            <textarea
              rows={4}
              value={settings.about_text || ''}
              onChange={(e) => handleChange('about_text', e.target.value)}
              className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-neutral-400 mb-1">عدد المعدات</label>
              <input
                type="text"
                value={settings.stat_equipment || ''}
                onChange={(e) => handleChange('stat_equipment', e.target.value)}
                placeholder="120+"
                className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-400 mb-1">مساحة الصالة</label>
              <input
                type="text"
                value={settings.stat_area || ''}
                onChange={(e) => handleChange('stat_area', e.target.value)}
                placeholder="1500م²"
                className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-400 mb-1">عدد البرامج</label>
              <input
                type="text"
                value={settings.stat_programs || ''}
                onChange={(e) => handleChange('stat_programs', e.target.value)}
                placeholder="15+"
                className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-400 mb-1">عدد المدربين</label>
              <input
                type="text"
                value={settings.stat_coaches || ''}
                onChange={(e) => handleChange('stat_coaches', e.target.value)}
                placeholder="10+"
                className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xl shadow-red-950/40 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ إعدادات الموقع'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

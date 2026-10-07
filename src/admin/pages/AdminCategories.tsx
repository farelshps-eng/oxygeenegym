import React, { useState, useEffect } from 'react';
import { Tags, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Category } from '../../types';
import { api } from '../../services/api';

type CategoryType = 'equipment' | 'training' | 'news' | 'products';

export const AdminCategories: React.FC = () => {
  const [activeType, setActiveType] = useState<CategoryType>('equipment');
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const tabs: { id: CategoryType; label: string }[] = [
    { id: 'equipment', label: 'تصنيفات المعدات' },
    { id: 'training', label: 'تصنيفات التمارين' },
    { id: 'news', label: 'تصنيفات الأخبار' },
    { id: 'products', label: 'تصنيفات المنتجات' },
  ];

  useEffect(() => {
    loadCategories();
  }, [activeType]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories(activeType);
      setCategories(data);
    } catch {
      showToast('فشل تحميل التصنيفات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await api.createCategory(activeType, newCatName.trim());
      showToast('تمت إضافة التصنيف بنجاح');
      setNewCatName('');
      loadCategories();
    } catch (err: any) {
      showToast(err.message || 'فشل إضافة التصنيف', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteCategory(activeType, id);
      showToast('تم حذف التصنيف بنجاح');
      loadCategories();
    } catch {
      showToast('فشل حذف التصنيف', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
          <Tags className="w-6 h-6 text-red-500" />
          <span>إدارة التصنيفات والأقسام</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          إدارة فئات المعدات والتمارين والأخبار والمنتجات لسهولة الفلترة والبحث
        </p>
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

      {/* Type Selector Tabs */}
      <div className="flex gap-2 border-b border-neutral-800 pb-3 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveType(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeType === tab.id
                ? 'bg-red-600 text-white font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add New Category Box */}
      <form onSubmit={handleAdd} className="bg-[#0f0f13] border border-neutral-800 rounded-xl p-4 flex gap-3">
        <input
          type="text"
          required
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="أدخل اسم التصنيف الجديد..."
          className="flex-1 bg-[#14141a] border border-neutral-800 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة</span>
        </button>
      </form>

      {/* Categories List */}
      <div className="bg-[#0f0f13] border border-neutral-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-500 text-xs">جاري تحميل التصنيفات...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-xs">لا توجد تصنيفات مضافة في هذا القسم.</div>
        ) : (
          <div className="divide-y divide-neutral-800/80">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-4 flex items-center justify-between hover:bg-neutral-900/40 transition-colors"
              >
                <div>
                  <span className="font-semibold text-white text-sm">{c.name}</span>
                  <span className="text-xs text-neutral-500 font-mono block mt-0.5">
                    الرمز التعريفي: {c.slug}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 rounded-lg hover:bg-red-950 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  title="حذف التصنيف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

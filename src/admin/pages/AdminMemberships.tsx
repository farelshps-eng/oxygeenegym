import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Search, Edit2, Trash2, X, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { Membership } from '../../types';
import { api } from '../../services/api';

export const AdminMemberships: React.FC = () => {
  const [plans, setPlans] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Membership | null>(null);
  const [form, setForm] = useState<Partial<Membership>>({
    name: '',
    slug: '',
    price: 0,
    currency: 'د.ل',
    duration: 'شهر واحد',
    features_json: '[]',
    description: '',
    is_featured: 0,
    is_active: 1,
    display_order: 0,
  });

  const [featuresInput, setFeaturesInput] = useState('');
  const [itemToDelete, setItemToDelete] = useState<Membership | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadMemberships();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadMemberships = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminMemberships();
      setPlans(data);
    } catch (err) {
      showToast('فشل تحميل باقات الاشتراك', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      name: '',
      slug: '',
      price: 150,
      currency: 'د.ل',
      duration: 'شهر واحد',
      features_json: '[]',
      description: '',
      is_featured: 0,
      is_active: 1,
      display_order: plans.length + 1,
    });
    setFeaturesInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Membership) => {
    setEditingItem(item);
    setForm({ ...item });
    try {
      const feats = JSON.parse(item.features_json || '[]');
      setFeaturesInput(feats.join('\n'));
    } catch {
      setFeaturesInput('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.duration?.trim()) {
      showToast('اسم الباقة والمدة مطلوبان', 'error');
      return;
    }

    const featsArray = featuresInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...form,
      features_json: JSON.stringify(featsArray),
    };

    try {
      if (editingItem) {
        await api.updateMembership(editingItem.id, payload);
        showToast('تم تحديث باقة الاشتراك بنجاح');
      } else {
        await api.createMembership(payload);
        showToast('تمت إضافة باقة الاشتراك بنجاح');
      }
      setIsModalOpen(false);
      loadMemberships();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteMembership(itemToDelete.id);
      showToast('تم حذف باقة الاشتراك بنجاح');
      setItemToDelete(null);
      loadMemberships();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف الباقة', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-red-500" />
            <span>إدارة باقات الاشتراك والأسعار</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            إضافة وتعديل باقات الاشتراك الشهرية والسنوية والتدريب الخاص (للعرض والإعلام فقط)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-red-950/40 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة باقة اشتراك جديدة</span>
        </button>
      </div>

      {/* Strict policy reminder */}
      <div className="p-4 bg-[#14141a] border border-neutral-800 rounded-xl flex items-center gap-3 text-xs text-neutral-400">
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
        <span>
          تذكير برمجي: جميع باقات الاشتراك معروضة إعلامياً فقط لتوجيه المشتركين لزيارة الجيم حضورياً. لا يتوفر دفع أو اشتراك إلكتروني عبر الموقع.
        </span>
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

      {/* Table */}
      <div className="bg-[#0f0f13] border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#14141a] text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="p-3 text-start">اسم الباقة</th>
                <th className="p-3 text-start">المدة</th>
                <th className="p-3 text-start">السعر والعملة</th>
                <th className="p-3 text-center">مميزة</th>
                <th className="p-3 text-center">الترتيب</th>
                <th className="p-3 text-center">الحالة</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    جاري تحميل الباقات...
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    لا توجد باقات مضافة.
                  </td>
                </tr>
              ) : (
                plans.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-3 font-semibold text-white">
                      <span>{item.name}</span>
                      {item.description && (
                        <span className="text-[11px] text-neutral-400 block font-normal line-clamp-1 mt-0.5">
                          {item.description}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-neutral-300 font-semibold">{item.duration}</td>
                    <td className="p-3 text-red-400 font-bold font-mono">
                      {item.price > 0 ? `${item.price} ${item.currency}` : 'حسب الطلب'}
                    </td>
                    <td className="p-3 text-center">
                      {item.is_featured === 1 ? (
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mx-auto" />
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center text-neutral-400 font-mono">
                      {item.display_order}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded text-[11px] font-semibold ${
                          item.is_active
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {item.is_active ? 'نشطة' : 'معطلة'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 rounded hover:bg-red-950 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-[#111115] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-500" />
                <span>{editingItem ? 'تعديل باقة الاشتراك' : 'إضافة باقة جديدة'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    اسم الباقة *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="مثال: الباقة الشهرية الأساسية (BASIC)"
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    المدة الزمنية *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="مثال: شهر واحد / 3 أشهر / 12 حصة"
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    السعر
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    placeholder="150"
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    العملة
                  </label>
                  <input
                    type="text"
                    value={form.currency || 'د.ل'}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    placeholder="د.ل"
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  المميزات المتضمنة (ميزة واحدة في كل سطر)
                </label>
                <textarea
                  rows={4}
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="دخول كامل لصالة الحديد&#10;خزانة خاصة&#10;استخدام الشاور ومرافق الراحة"
                  className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 resize-none font-sans"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  وصف الباقة
                </label>
                <textarea
                  rows={2}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="توضيح لمن تناسب هذه الخطة..."
                  className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    ترتيب العرض
                  </label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="mem_featured"
                    checked={form.is_featured === 1}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-neutral-900 border-neutral-700"
                  />
                  <label htmlFor="mem_featured" className="text-neutral-300 font-semibold cursor-pointer">
                    باقة مميزة في الواجهة
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="mem_active"
                    checked={form.is_active === 1}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-neutral-900 border-neutral-700"
                  />
                  <label htmlFor="mem_active" className="text-neutral-300 font-semibold cursor-pointer">
                    نشر الباقة
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-950/40 cursor-pointer"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111115] border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-600/30 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">تأكيد حذف باقة الاشتراك</h3>
              <p className="text-xs text-neutral-400">
                هل أنت متأكد من حذف <strong className="text-white font-bold">{itemToDelete.name}</strong>؟
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

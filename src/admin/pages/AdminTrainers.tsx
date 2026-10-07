import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Trash2, X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { Trainer } from '../../types';
import { api } from '../../services/api';

export const AdminTrainers: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Trainer | null>(null);
  const [form, setForm] = useState<Partial<Trainer>>({
    name: '',
    slug: '',
    photo_url: '',
    specialty: '',
    bio: '',
    experience: '',
    training_types_json: '[]',
    display_order: 0,
    is_published: 1,
  });

  const [trainingTypesInput, setTrainingTypesInput] = useState('');
  const [itemToDelete, setItemToDelete] = useState<Trainer | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadTrainers();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadTrainers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminTrainers();
      setTrainers(data);
    } catch (err) {
      showToast('فشل تحميل قائمة المدربين', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      name: '',
      slug: '',
      photo_url: '',
      specialty: 'مدرب لياقة وبناء أجسام',
      bio: '',
      experience: '5 سنوات خبرة',
      training_types_json: '[]',
      display_order: trainers.length + 1,
      is_published: 1,
    });
    setTrainingTypesInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Trainer) => {
    setEditingItem(item);
    setForm({ ...item });
    try {
      const types = JSON.parse(item.training_types_json || '[]');
      setTrainingTypesInput(types.join(', '));
    } catch {
      setTrainingTypesInput('');
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadMedia(file);
      setForm((prev) => ({ ...prev, photo_url: res.url }));
      showToast('تم رفع صورة المدرب بنجاح');
    } catch (err: any) {
      showToast(err.message || 'فشل رفع الصورة', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      showToast('اسم المدرب مطلوب', 'error');
      return;
    }

    const typesArray = trainingTypesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...form,
      training_types_json: JSON.stringify(typesArray),
    };

    try {
      if (editingItem) {
        await api.updateTrainer(editingItem.id, payload);
        showToast('تم تحديث بيانات المدرب بنجاح');
      } else {
        await api.createTrainer(payload);
        showToast('تمت إضافة المدرب بنجاح');
      }
      setIsModalOpen(false);
      loadTrainers();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteTrainer(itemToDelete.id);
      showToast('تم حذف المدرب بنجاح');
      setItemToDelete(null);
      loadTrainers();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف المدرب', 'error');
    }
  };

  const filtered = trainers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.specialty?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-red-500" />
            <span>إدارة الكادر التدريبي والمدربين</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            إضافة وتعديل بيانات المدربين المعتمدين وتخصصاتهم وسنوات الخبرة
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-red-950/40 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مدرب جديد</span>
        </button>
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

      <div className="bg-[#0f0f13] border border-neutral-800 rounded-xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم المدرب أو التخصص..."
            className="w-full bg-[#14141a] border border-neutral-800 rounded-lg pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
          />
        </div>
      </div>

      <div className="bg-[#0f0f13] border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#14141a] text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="p-3 text-start">الصورة</th>
                <th className="p-3 text-start">اسم المدرب</th>
                <th className="p-3 text-start">التخصص</th>
                <th className="p-3 text-start">الخبرة</th>
                <th className="p-3 text-center">الترتيب</th>
                <th className="p-3 text-center">الحالة</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    جاري تحميل المدربين...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    لا يوجد مدربون مضافون.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-3">
                      {item.photo_url ? (
                        <img
                          src={item.photo_url}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg bg-neutral-950"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-600">
                          <Users className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-white">
                      <span>{item.name}</span>
                    </td>
                    <td className="p-3 text-neutral-300">
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-[11px]">
                        {item.specialty || 'مدرب'}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-400">
                      {item.experience || '—'}
                    </td>
                    <td className="p-3 text-center text-neutral-400 font-mono">
                      {item.display_order}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded text-[11px] font-semibold ${
                          item.is_published
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {item.is_published ? 'منشور' : 'مخفي'}
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
                <Users className="w-5 h-5 text-red-500" />
                <span>{editingItem ? 'تعديل بيانات المدرب' : 'إضافة مدرب جديد'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  اسم المدرب *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: كابتن وليد"
                  className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  صورة المدرب الشخصية
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.photo_url || ''}
                    onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                    placeholder="رابط الصورة أو ارفع من جهازك..."
                    className="flex-1 bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-mono"
                  />
                  <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap">
                    <Upload className="w-4 h-4 text-red-400" />
                    <span>{uploadingImage ? '...' : 'رفع'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    التخصص التدريبي
                  </label>
                  <input
                    type="text"
                    value={form.specialty || ''}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                    placeholder="مثال: مدرب فنون قتالية وملاكمة"
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    سنوات الخبرة والشهادات
                  </label>
                  <input
                    type="text"
                    value={form.experience || ''}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="مثال: 10 سنوات خبرة"
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  الرياضات والتمارين التابعة (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  value={trainingTypesInput}
                  onChange={(e) => setTrainingTypesInput(e.target.value)}
                  placeholder="مثال: الملاكمة الاحترافية, كيك بوكسينج, لياقة بدنية"
                  className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  السيرة الذاتية ونبذة عن المدرب
                </label>
                <textarea
                  rows={3}
                  value={form.bio || ''}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="معلومات عن البطولات، أسلوب التدريب، والنتائج..."
                  className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    id="trainer_published"
                    checked={form.is_published === 1}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-neutral-900 border-neutral-700"
                  />
                  <label htmlFor="trainer_published" className="text-neutral-300 font-semibold cursor-pointer">
                    نشر في الموقع العام
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
              <h3 className="text-lg font-bold text-white">تأكيد حذف المدرب</h3>
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

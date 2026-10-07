import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Equipment, Category } from '../../types';
import { api } from '../../services/api';

export const AdminEquipment: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [form, setForm] = useState<Partial<Equipment>>({
    name: '',
    slug: '',
    image_url: '',
    description: '',
    category_name: '',
    manufacturer: '',
    model: '',
    target_muscles: '',
    usage_level: '',
    instructions: '',
    display_order: 0,
    is_featured: 0,
    is_published: 1,
  });

  // Delete confirmation
  const [itemToDelete, setItemToDelete] = useState<Equipment | null>(null);

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [eqData, catData] = await Promise.all([
        api.getAdminEquipment(),
        api.getCategories('equipment'),
      ]);
      setEquipmentList(eqData);
      setCategories(catData);
    } catch (err) {
      showToast('فشل تحميل قائمة المعدات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      name: '',
      slug: '',
      image_url: '',
      description: '',
      category_name: categories[0]?.name || 'الأوزان الحرة',
      manufacturer: '',
      model: '',
      target_muscles: '',
      usage_level: 'جميع المستويات',
      instructions: '',
      display_order: equipmentList.length + 1,
      is_featured: 0,
      is_published: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Equipment) => {
    setEditingItem(item);
    setForm({ ...item });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('يرجى اختيار ملف صورة صالح', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const res = await api.uploadMedia(file);
      setForm((prev) => ({ ...prev, image_url: res.url }));
      showToast('تم رفع الصورة بنجاح');
    } catch (err: any) {
      showToast(err.message || 'فشل رفع الصورة', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      showToast('اسم المعدة مطلوب', 'error');
      return;
    }

    try {
      if (editingItem) {
        await api.updateEquipment(editingItem.id, form);
        showToast('تم تحديث بيانات المعدة بنجاح');
      } else {
        await api.createEquipment(form);
        showToast('تمت إضافة المعدة بنجاح');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteEquipment(itemToDelete.id);
      showToast('تم حذف المعدة بنجاح');
      setItemToDelete(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف المعدة', 'error');
    }
  };

  const handleTogglePublish = async (item: Equipment) => {
    try {
      const res = await api.toggleEquipmentPublish(item.id);
      setEquipmentList((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, is_published: res.is_published } : e))
      );
      showToast(res.is_published ? 'تم نشر المعدة' : 'تم إخفاء المعدة');
    } catch (err) {
      showToast('فشل تعديل حالة النشر', 'error');
    }
  };

  const handleToggleFeatured = async (item: Equipment) => {
    try {
      const res = await api.toggleEquipmentFeatured(item.id);
      setEquipmentList((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, is_featured: res.is_featured } : e))
      );
      showToast(res.is_featured ? 'تم تمييز المعدة' : 'تم إلغاء التمييز');
    } catch (err) {
      showToast('فشل تعديل التمييز', 'error');
    }
  };

  const filtered = equipmentList.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.target_muscles?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'all' || item.category_name === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-red-500" />
            <span>إدارة المعدات والأجهزة</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            إضافة وتعديل وحذف ونشر أجهزة ومعدات صالة أوكسجين جيم
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-red-950/40 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة معدة جديدة</span>
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400'
              : 'bg-red-950/60 border border-red-800 text-red-400'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-[#0f0f13] border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-stretch justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو العضلات المستهدفة..."
            className="w-full bg-[#14141a] border border-neutral-800 rounded-lg pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-[#14141a] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
        >
          <option value="all">جميع التصنيفات ({equipmentList.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0f0f13] border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#14141a] text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="p-3 text-start">الصورة</th>
                <th className="p-3 text-start">اسم المعدة</th>
                <th className="p-3 text-start">التصنيف</th>
                <th className="p-3 text-start">الشركة / الموديل</th>
                <th className="p-3 text-center">الترتيب</th>
                <th className="p-3 text-center">الحالة</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    جاري تحميل المعدات...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    لا توجد معدات مطابقة.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg bg-neutral-950"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-600">
                          <Dumbbell className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {item.is_featured === 1 && (
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      {item.target_muscles && (
                        <span className="text-[11px] text-neutral-400 block font-normal mt-0.5">
                          العضلات: {item.target_muscles}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-neutral-300">
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-[11px]">
                        {item.category_name || 'عام'}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-400 font-mono text-[11px]">
                      {item.manufacturer ? `${item.manufacturer} ${item.model || ''}` : '—'}
                    </td>
                    <td className="p-3 text-center text-neutral-400 font-mono">
                      {item.display_order}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          item.is_published
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                        title="انقر لتبديل حالة النشر"
                      >
                        {item.is_published ? 'منشورة' : 'مخفية'}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleToggleFeatured(item)}
                          className={`p-1.5 rounded hover:bg-neutral-800 transition-colors ${
                            item.is_featured ? 'text-yellow-400' : 'text-neutral-500 hover:text-white'
                          }`}
                          title={item.is_featured ? 'إلغاء التمييز' : 'تمييز كمعدة مميزة'}
                        >
                          <Star className="w-4 h-4" />
                        </button>
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#111115] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-red-500" />
                <span>{editingItem ? 'تعديل بيانات المعدة' : 'إضافة معدة جديدة'}</span>
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
                    اسم المعدة *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="مثال: جهاز ضغط الصدر العريض"
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    التصنيف *
                  </label>
                  <select
                    value={form.category_name}
                    onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Uploader & URL */}
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  صورة المعدة
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={form.image_url || ''}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      placeholder="رابط الصورة أو ارفع ملف من جهازك"
                      className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 text-xs font-mono"
                    />
                  </div>
                  <label className="w-full sm:w-auto px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap">
                    <Upload className="w-4 h-4 text-red-400" />
                    <span>{uploadingImage ? 'جاري الرفع...' : 'رفع صورة'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
                {form.image_url && (
                  <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-neutral-800 relative">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image_url: '' })}
                      className="absolute top-1 right-1 p-0.5 rounded bg-black/80 text-red-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  وصف المعدة
                </label>
                <textarea
                  rows={3}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف مختصر للمعدة ومميزاتها الحركية..."
                  className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    الشركة المصنعة (اختياري)
                  </label>
                  <input
                    type="text"
                    value={form.manufacturer || ''}
                    onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                    placeholder="مثال: Hammer Strength / Life Fitness"
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    الموديل (اختياري)
                  </label>
                  <input
                    type="text"
                    value={form.model || ''}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="مثال: HD Elite Series"
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    العضلات المستهدفة
                  </label>
                  <input
                    type="text"
                    value={form.target_muscles || ''}
                    onChange={(e) => setForm({ ...form, target_muscles: e.target.value })}
                    placeholder="مثال: الصدر العلوي، الأكتاف، الترايسبس"
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    مستوى الاستخدام
                  </label>
                  <select
                    value={form.usage_level || 'جميع المستويات'}
                    onChange={(e) => setForm({ ...form, usage_level: e.target.value })}
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="جميع المستويات">جميع المستويات</option>
                    <option value="مبتدئ">مبتدئ</option>
                    <option value="متوسط">متوسط</option>
                    <option value="متقدم / محترف">متقدم / محترف</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  تعليمات الاستخدام والأداء الصحيح
                </label>
                <textarea
                  rows={2}
                  value={form.instructions || ''}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  placeholder="ارشادات السلامة وضبط المقعد وحركة التمرين..."
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
                    id="is_featured"
                    checked={form.is_featured === 1}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-neutral-900 border-neutral-700"
                  />
                  <label htmlFor="is_featured" className="text-neutral-300 font-semibold cursor-pointer">
                    معدة مميزة في الرئيسية
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={form.is_published === 1}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-neutral-900 border-neutral-700"
                  />
                  <label htmlFor="is_published" className="text-neutral-300 font-semibold cursor-pointer">
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
                  {editingItem ? 'حفظ التعديلات' : 'إضافة المعدة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111115] border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-600/30 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">هل أنت متأكد من حذف هذه المعدة؟</h3>
              <p className="text-xs text-neutral-400">
                سيتم إزالة <strong className="text-white font-bold">{itemToDelete.name}</strong> نهائياً من قاعدة البيانات والموقع.
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

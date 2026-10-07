import React, { useState, useEffect } from 'react';
import { Share2, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { SocialLink } from '../../types';
import { api } from '../../services/api';

export const AdminSocialLinks: React.FC = () => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SocialLink | null>(null);
  const [form, setForm] = useState<Partial<SocialLink>>({
    platform: 'Instagram',
    url: '',
    is_active: 1,
    order_index: 0,
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadLinks();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadLinks = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminSocialLinks();
      setLinks(data);
    } catch {
      showToast('فشل تحميل الروابط الاجتماعية', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      platform: 'Instagram',
      url: '',
      is_active: 1,
      order_index: links.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SocialLink) => {
    setEditingItem(item);
    setForm({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.platform || !form.url) {
      showToast('المنصة والرابط مطلوبان', 'error');
      return;
    }

    try {
      if (editingItem) {
        await api.updateSocialLink(editingItem.id, form);
        showToast('تم تحديث الرابط بنجاح');
      } else {
        await api.createSocialLink(form);
        showToast('تمت إضافة الرابط بنجاح');
      }
      setIsModalOpen(false);
      loadLinks();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteSocialLink(id);
      showToast('تم حذف الرابط بنجاح');
      loadLinks();
    } catch {
      showToast('فشل حذف الرابط', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
            <Share2 className="w-6 h-6 text-red-500" />
            <span>إدارة الروابط الاجتماعية</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            إدارة حسابات الجيم الرسمية (Instagram, Facebook, WhatsApp, TikTok, YouTube)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-red-950/40 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة رابط جديد</span>
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

      <div className="bg-[#0f0f13] border border-neutral-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-500 text-xs">جاري تحميل الروابط...</div>
        ) : links.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-xs">لا توجد روابط مضافة.</div>
        ) : (
          <div className="divide-y divide-neutral-800/80">
            {links.map((link) => (
              <div
                key={link.id}
                className="p-4 flex items-center justify-between hover:bg-neutral-900/40 transition-colors text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{link.platform}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        link.is_active ? 'bg-emerald-950 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {link.is_active ? 'نشط' : 'معطل'}
                    </span>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-red-400 font-mono text-[11px] block mt-0.5 truncate max-w-md"
                  >
                    {link.url}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(link)}
                    className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-1.5 rounded hover:bg-red-950 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#111115] border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingItem ? 'تعديل الرابط الاجتماعي' : 'إضافة رابط منصة'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">المنصة</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">رابط الحساب (URL)</label>
                <input
                  type="url"
                  required
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#14141a] border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-600 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="link_active"
                  checked={form.is_active === 1}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-neutral-900 border-neutral-700"
                />
                <label htmlFor="link_active" className="text-neutral-300 font-semibold cursor-pointer">
                  تفعيل الرابط في الموقع
                </label>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

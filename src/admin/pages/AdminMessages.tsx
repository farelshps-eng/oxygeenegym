import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, Trash2, MailCheck, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { ContactMessage } from '../../types';
import { api } from '../../services/api';

export const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await api.getContactMessages();
      setMessages(data);
    } catch {
      showToast('فشل تحميل الرسائل', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRead = async (id: number) => {
    try {
      const res = await api.toggleMessageRead(id);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: res.is_read } : m))
      );
    } catch {
      showToast('فشل تعديل حالة القراءة', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      showToast('تم حذف الرسالة بنجاح');
    } catch {
      showToast('فشل حذف الرسالة', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-red-500" />
          <span>رسائل واستفسارات الزوار</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          متابعة الرسائل والاستفسارات الواردة عبر نموذج تواصل معنا بالموقع
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

      {loading ? (
        <div className="text-center py-20 text-neutral-500">جاري تحميل الرسائل...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 bg-[#0f0f13] border border-neutral-800 rounded-2xl p-8 space-y-3">
          <MessageSquare className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">لا توجد رسائل واردة حاليًا</h3>
          <p className="text-xs text-neutral-400">ستظهر استفسارات الزوار هنا فور إرسالها.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-5 rounded-xl border transition-all ${
                msg.is_read
                  ? 'bg-[#0f0f13] border-neutral-800/80 text-neutral-400'
                  : 'bg-[#14141a] border-red-900/40 text-neutral-200 shadow-md shadow-red-950/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 border-b border-neutral-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      msg.is_read ? 'bg-neutral-600' : 'bg-red-500 animate-pulse'
                    }`}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{msg.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-500" />
                      <a href={`tel:${msg.phone}`} className="hover:text-red-400 font-bold">
                        {msg.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {new Date(msg.created_at).toLocaleString('ar-LY')}
                  </span>
                  <button
                    onClick={() => handleToggleRead(msg.id)}
                    className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title={msg.is_read ? 'تحديد كغير مقروء' : 'تحديد كمقروء'}
                  >
                    {msg.is_read ? <Mail className="w-4 h-4" /> : <MailCheck className="w-4 h-4 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 rounded hover:bg-red-950 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    title="حذف الرسالة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line font-light">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

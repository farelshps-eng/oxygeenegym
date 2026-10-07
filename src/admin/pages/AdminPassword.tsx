import React, { useState } from 'react';
import { KeyRound, Lock, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { api } from '../../services/api';

export const AdminPassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('يرجى تعبئة كافة الحقول', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('كلمة المرور الجديدة وتأكيدها غير متطابقين', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      showToast('تم تغيير كلمة المرور بنجاح');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'فشل تغيير كلمة المرور', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-red-500" />
          <span>الأمان وتغيير كلمة المرور</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          تحديث كلمة مرور الدخول للوحة إدارة أوكسجين جيم
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

      <form onSubmit={handleSubmit} className="bg-[#0f0f13] border border-neutral-800 rounded-xl p-6 space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-neutral-300 mb-1">
            كلمة المرور الحالية *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#14141a] border border-neutral-800 rounded-lg pr-9 pl-3 py-2.5 text-white focus:outline-none focus:border-red-600 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-neutral-300 mb-1">
            كلمة المرور الجديدة * (6 أحرف على الأقل)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#14141a] border border-neutral-800 rounded-lg pr-9 pl-3 py-2.5 text-white focus:outline-none focus:border-red-600 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-neutral-300 mb-1">
            تأكيد كلمة المرور الجديدة *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#14141a] border border-neutral-800 rounded-lg pr-9 pl-3 py-2.5 text-white focus:outline-none focus:border-red-600 font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-lg transition-all shadow-lg shadow-red-950/40 flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

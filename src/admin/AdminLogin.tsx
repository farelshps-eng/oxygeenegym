import React, { useState } from 'react';
import { Shield, Lock, User, ArrowLeft, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { api, setAuthToken } from '../services/api';
import { User as UserType } from '../types';
import { GymLogo } from '../components/GymLogo';

interface AdminLoginProps {
  onSuccess: (user: UserType) => void;
  onExit: () => void;
}

const QUICK_ACCOUNTS = [
  { username: 'manager', label: 'مدير الجيم', hint: 'إدارة الصالة', emoji: '👔' },
  { username: 'waleed', label: 'كابتن وليد', hint: 'مدير ومدرب عام', emoji: '🏋️' },
  { username: 'ali', label: 'كابتن علي', hint: 'مدرب اللياقة', emoji: '💪' },
] as const;

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onExit }) => {
  const [username, setUsername] = useState('manager');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.login({
        username: username.trim() || 'manager',
        password: password.trim(),
      });
      setAuthToken(res.token);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-md bg-[#0f0f15] border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-red-950/30 relative text-right">
        <button
          onClick={onExit}
          className="absolute top-6 left-6 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>الموقع</span>
        </button>

        <div className="text-center pt-2 space-y-2">
          <div className="flex justify-center mb-2">
            <GymLogo size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/30 text-red-500 text-[11px] font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>لوحة الإدارة المحمية</span>
          </div>
          <h1 className="text-2xl font-black font-heading text-white tracking-wide uppercase">
            تسجيل دخول الإدارة
          </h1>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
            استخدم حساب الموظف المعتمد وكلمة المرور التي تم تعيينها من لوحة «تغيير كلمة المرور».
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            اختر حساباً:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {QUICK_ACCOUNTS.map((acc) => (
              <button
                key={acc.username}
                type="button"
                onClick={() => {
                  setUsername(acc.username);
                  setError(null);
                }}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer active:scale-95 ${
                  username === acc.username
                    ? 'bg-red-950/40 border-red-600/60'
                    : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{acc.emoji}</span>
                  <span className="font-bold text-xs text-white">{acc.label}</span>
                </div>
                <p className="text-[10px] text-neutral-400">{acc.hint}</p>
                <span className="inline-block mt-1 text-[9px] font-mono text-neutral-500">{acc.username}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-900/80 rounded-xl text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">اسم المستخدم</label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#13131a] border border-neutral-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-[#13131a] border border-neutral-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-xl shadow-red-950/40 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>دخول لوحة التحكم</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

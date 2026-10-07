import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Lock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Flame,
  Shield,
  HelpCircle,
  Info,
  ArrowRight,
  UserCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api, setMemberToken, setStoredMember } from '../services/api';
import { Member, MemberNotification } from '../types';
import { GymLogo } from './GymLogo';

interface MemberAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (member: Member, notifications: MemberNotification[]) => void;
  initialMode?: 'login' | 'register';
}

export const MemberAuthModal: React.FC<MemberAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showAlreadyRegisteredHint, setShowAlreadyRegisteredHint] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Remembered phone from localStorage
  const lastSavedPhone = typeof window !== 'undefined' ? localStorage.getItem('oxygen_last_member_phone') || '' : '';
  const lastSavedName = typeof window !== 'undefined' ? localStorage.getItem('oxygen_last_member_name') || '' : '';

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState(lastSavedPhone);
  const [loginPassword, setLoginPassword] = useState('');

  // Sync mode whenever initialMode or isOpen changes
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMsg(null);
      if (!loginIdentifier && lastSavedPhone) {
        setLoginIdentifier(lastSavedPhone);
      }
    }
  }, [initialMode, isOpen]);

  // Register form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState<string>('25');

  // Questionnaire questions - Defaults to YES so button is never locked
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true);
  const [planName, setPlanName] = useState('الباقة الشهرية الأساسية (BASIC)');
  const [customPlan, setCustomPlan] = useState('');

  // Default dates: today -> 1 month from now
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEnd = new Date();
  defaultEnd.setMonth(defaultEnd.getMonth() + 1);
  const endStr = defaultEnd.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(endStr);
  const [fitnessGoal, setFitnessGoal] = useState('بناء أجسام وزيادة القوة والكتلة العضلية');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError('يرجى إدخال رقم الهاتف أو البريد وكلمة المرور');
      return;
    }

    setLoading(true);
    setError(null);
    setShowAlreadyRegisteredHint(false);
    try {
      const res = await api.loginMember({
        identifier: loginIdentifier.trim(),
        password: loginPassword.trim(),
      });
      setMemberToken(res.token);
      setStoredMember(res.member);
      localStorage.setItem('oxygen_last_member_phone', res.member.phone);
      localStorage.setItem('oxygen_last_member_name', res.member.full_name);
      setSuccessMsg(`تم تسجيل الدخول بنجاح! مرحباً بك ${res.member.full_name}`);
      setTimeout(() => {
        onSuccess(res.member, res.notifications || []);
        onClose();
      }, 400);
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة، يرجى التأكد من كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowAlreadyRegisteredHint(false);

    if (!fullName.trim()) {
      setError('يرجى إدخال الاسم الكامل');
      return;
    }
    if (!phone.trim()) {
      setError('يرجى إدخال رقم الهاتف');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError('يرجى إدخال كلمة مرور من 6 خانات على الأقل');
      return;
    }

    if (isSubscribed && (!startDate || !endDate)) {
      setError('يرجى تحديد تاريخ بداية ونهاية الاشتراك');
      return;
    }

    setLoading(true);
    try {
      const finalPlan = planName === 'أخرى' && customPlan.trim() ? customPlan.trim() : planName;
      const res = await api.registerMember({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        password: password.trim(),
        age: age ? Number(age) : undefined,
        is_subscribed: isSubscribed,
        plan_name: isSubscribed ? finalPlan : undefined,
        start_date: isSubscribed ? startDate : undefined,
        end_date: isSubscribed ? endDate : undefined,
        fitness_goal: fitnessGoal,
      });

      setMemberToken(res.token);
      setStoredMember(res.member);
      localStorage.setItem('oxygen_last_member_phone', res.member.phone);
      localStorage.setItem('oxygen_last_member_name', res.member.full_name);
      setSuccessMsg('تم حفظ وإنشاء الحساب في قاعدة البيانات بنجاح!');

      setTimeout(() => {
        onSuccess(res.member, res.notifications || []);
        onClose();
      }, 500);
    } catch (err: any) {
      const msg = err.message || 'تعذر إنشاء الحساب';
      setError(msg);
      if (msg.includes('مسجل بالفعل')) {
        setShowAlreadyRegisteredHint(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e0e14] border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-red-950/20 text-right my-6">
        {/* Close Button - 44px touch target */}
        <button
          onClick={onClose}
          type="button"
          aria-label="إغلاق النافذة"
          className="absolute top-4 left-4 p-3 rounded-2xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center pb-4 border-b border-neutral-800/80">
          <div className="flex justify-center mb-2">
            <GymLogo size="md" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
            {mode === 'login' ? 'تسجيل دخول المشتركين' : 'إنشاء حساب رياضي جديد'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'login'
              ? 'متابعة حالة اشتراكك، المتبقي من الأيام، والتنبيهات المباشرة'
              : 'سجل بياناتك واستبيان اشتراكك لحفظ حسابك في منظومة أوكسجين جيم'}
          </p>

          {/* Mode Switcher */}
          <div className="flex bg-[#14141c] p-1.5 rounded-2xl border border-neutral-800 mt-4 max-w-xs mx-auto gap-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 px-3 min-h-[44px] text-xs font-bold rounded-xl transition-all cursor-pointer touch-manipulation active:scale-[0.98] ${
                mode === 'login'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 px-3 min-h-[44px] text-xs font-bold rounded-xl transition-all cursor-pointer touch-manipulation active:scale-[0.98] ${
                mode === 'register'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              إنشاء حساب جديد
            </button>
          </div>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="mt-4 p-3.5 bg-emerald-950/50 border border-emerald-800/80 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mt-4 p-3.5 bg-red-950/40 border border-red-900/80 rounded-2xl text-xs text-red-400 space-y-2.5 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>

            {showAlreadyRegisteredHint && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setLoginIdentifier(phone);
                  setError(null);
                }}
                className="text-xs text-white underline font-bold block pt-1 hover:text-red-300 cursor-pointer"
              >
                انقر هنا لتسجيل الدخول برقم ({phone}) مباشرة ➔
              </button>
            )}
          </div>
        )}

        {/* ---------------- LOGIN FORM ---------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 mt-5">
            {/* Quick Remembered Phone Chip */}
            {lastSavedPhone && (
              <button
                type="button"
                onClick={() => setLoginIdentifier(lastSavedPhone)}
                className="w-full p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 hover:border-red-800 transition-colors cursor-pointer text-right"
              >
                استخدام آخر رقم على هذا الجهاز:{' '}
                <strong className="text-white">{lastSavedName || lastSavedPhone}</strong>
              </button>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                رقم الهاتف أو البريد الإلكتروني أو الاسم
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="مثال: 091xxxxxxx أو البريد أو اسمك"
                  className="w-full bg-[#13131b] border border-neutral-800 rounded-xl pr-10 pl-4 py-3 text-base sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#13131b] border border-neutral-800 rounded-xl pr-10 pl-11 py-3 text-base sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 rounded-lg cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold py-3.5 min-h-[46px] rounded-xl transition-all shadow-lg shadow-red-950/40 cursor-pointer disabled:opacity-50 text-sm flex items-center justify-center gap-2 touch-manipulation"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>تسجيل الدخول للملف الرياضي</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                ليس لديك حساب بعد؟ <strong className="text-red-400 underline">إنشاء حساب جديد الآن</strong>
              </button>
            </div>
          </form>
        )}

        {/* ---------------- REGISTER QUESTIONNAIRE ---------------- */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-5">
            {/* 1. Basic Personal Info */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: محمد علي الفرجاني"
                    className="w-full bg-[#13131b] border border-neutral-800 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="091xxxxxxx"
                      className="w-full bg-[#13131b] border border-neutral-800 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    العمر
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="10"
                      max="90"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="25"
                      className="w-full bg-[#13131b] border border-neutral-800 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    كلمة المرور <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#13131b] border border-neutral-800 rounded-xl pr-10 pl-11 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 rounded-lg cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full bg-[#13131b] border border-neutral-800 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Questionnaire: Are you subscribed in gym? */}
            <div className="p-4 bg-[#14141d] border border-neutral-800 rounded-2xl space-y-3 pt-3">
              <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
                <HelpCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>سؤال الاستبيان: هل أنت مشترك حالياً في أوكسجين جيم؟</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                حدد حالة اشتراكك لضبط التنبيهات وحساب الأيام المتبقية في بطاقتك الرياضية.
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSubscribed(true)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSubscribed === true
                      ? 'bg-red-600/20 border-red-500 text-white shadow-lg shadow-red-950/30'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${isSubscribed === true ? 'text-red-500' : 'text-neutral-600'}`}
                  />
                  <span>نعم، مشترك حالياً</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSubscribed(false)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSubscribed === false
                      ? 'bg-neutral-800 border-neutral-600 text-white'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <X className="w-4 h-4 text-neutral-500" />
                  <span>لا، لست مشتركاً بعد</span>
                </button>
              </div>

              {/* Sub-Questions IF SUBSCRIBED */}
              {isSubscribed === true && (
                <div className="pt-3 space-y-3 border-t border-neutral-800/80 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      نوع باقة الاشتراك:
                    </label>
                    <select
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      className="w-full bg-[#0d0d12] border border-neutral-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600"
                    >
                      <option value="الباقة الشهرية الأساسية (BASIC)">الباقة الشهرية الأساسية (BASIC GYM)</option>
                      <option value="باقة VIP الذهبية الشاملة (GOLD VIP)">باقة VIP الذهبية الشاملة (GOLD VIP)</option>
                      <option value="باقة الملاكمة والفنون القتالية">باقة الملاكمة والفنون القتالية (COMBAT)</option>
                      <option value="اشتراك 3 أشهر المميز (3-MONTHS)">اشتراك 3 أشهر المميز (3-MONTHS)</option>
                      <option value="اشتراك 6 أشهر البلاتيني (6-MONTHS)">اشتراك 6 أشهر البلاتيني (6-MONTHS)</option>
                      <option value="الاشتراك السنوي الشامل (ANNUAL)">الاشتراك السنوي الشامل (ANNUAL)</option>
                      <option value="أخرى">باقة أخرى (كتابة مخصصة)</option>
                    </select>

                    {planName === 'أخرى' && (
                      <input
                        type="text"
                        required
                        value={customPlan}
                        onChange={(e) => setCustomPlan(e.target.value)}
                        placeholder="اكتب اسم الباقة الخاصة بك..."
                        className="w-full mt-2 bg-[#0d0d12] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">
                        متى بدأ اشتراكك؟ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-[#0d0d12] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">
                        متى ينتهي اشتراكك؟ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-[#0d0d12] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 bg-neutral-900/80 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      سيتم تفعيل نظام التنبيهات تلقائياً: إشعار استباقي قبل انتهاء الاشتراك بـ 7 أيام، وتنبيه فوري عند التجديد!
                    </span>
                  </div>
                </div>
              )}

              {/* Sub-Questions IF NOT SUBSCRIBED */}
              {isSubscribed === false && (
                <div className="pt-3 space-y-3 border-t border-neutral-800/80 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      الهدف الرياضي الأساسي:
                    </label>
                    <select
                      value={fitnessGoal}
                      onChange={(e) => setFitnessGoal(e.target.value)}
                      className="w-full bg-[#0d0d12] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    >
                      <option value="بناء أجسام وزيادة الكتلة العضلية">بناء أجسام وزيادة الكتلة العضلية</option>
                      <option value="خسارة الوزن وحرق الدهون">خسارة الوزن وحرق الدهون</option>
                      <option value="لياقة بدنية ومرونة عامة">لياقة بدنية ومرونة عامة</option>
                      <option value="ملاكمة ورياضات قتالية">ملاكمة ورياضات قتالية</option>
                      <option value="قوة بدنية ورفع أثقال">قوة بدنية ورفع أثقال</option>
                    </select>
                  </div>

                  <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-xl text-xs text-neutral-300">
                    <span className="font-bold text-red-400 block mb-0.5">ملاحظة هامة:</span>
                    <p className="text-[11px] leading-relaxed text-neutral-400">
                      حسابك سيتيح لك متابعة المعدات والأخبار والتمارين، ولتفعيل اشتراكك الفعلي واستلام بطاقة العضوية، نرحب بزيارتك لصالة أوكسجين جيم بطريق عين زارة - طرابلس.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-950/40 cursor-pointer disabled:opacity-50 text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد وحفظ بيانات الحساب الرياضي</span>
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                لديك حساب بالفعل؟ <strong className="text-red-400 underline">تسجيل الدخول</strong>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

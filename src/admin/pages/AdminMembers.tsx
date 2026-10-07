import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Phone,
  Mail,
  RotateCw,
  Shield,
  X,
  Save,
  ShieldAlert,
  Flame,
  MessageSquare,
  Dumbbell,
} from 'lucide-react';
import { api } from '../../services/api';
import { Member } from '../../types';
import { AdminCoachModal } from '../components/AdminCoachModal';

export const AdminMembers: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [renewMember, setRenewMember] = useState<Member | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [coachModalMember, setCoachModalMember] = useState<Member | null>(null);

  // Renew form state
  const [renewMonths, setRenewMonths] = useState<number>(1);
  const [renewPlan, setRenewPlan] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [submittingRenew, setSubmittingRenew] = useState(false);

  // Member form state (for Add / Edit)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    age: '',
    is_subscribed: 1,
    plan_name: 'الباقة الشهرية الأساسية (BASIC)',
    start_date: new Date().toISOString().split('T')[0],
    end_date: (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d.toISOString().split('T')[0];
    })(),
    fitness_goal: 'بناء أجسام وقوة بدنية',
    notes: '',
  });

  useEffect(() => {
    loadMembers();
  }, [statusFilter]);

  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAdminMembers({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'تعذر تحميل بيانات المشتركين');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadMembers();
  };

  // Open Edit Modal
  const handleOpenEdit = (m: Member) => {
    setEditMember(m);
    setFormData({
      full_name: m.full_name,
      phone: m.phone,
      email: m.email || '',
      password: '',
      age: m.age ? m.age.toString() : '',
      is_subscribed: m.is_subscribed,
      plan_name: m.plan_name || 'الباقة الشهرية الأساسية (BASIC)',
      start_date: m.start_date || new Date().toISOString().split('T')[0],
      end_date: m.end_date || '',
      fitness_goal: m.fitness_goal || '',
      notes: m.notes || '',
    });
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditMember(null);
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      password: '123',
      age: '25',
      is_subscribed: 1,
      plan_name: 'الباقة الشهرية الأساسية (BASIC)',
      start_date: new Date().toISOString().split('T')[0],
      end_date: d.toISOString().split('T')[0],
      fitness_goal: 'بناء أجسام',
      notes: 'تم التسجيل يدوياً بواسطة إدارة الجيم',
    });
    setIsAddModalOpen(true);
  };

  // Save Member (Add or Edit)
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMember) {
        await api.updateAdminMember(editMember.id, {
          ...formData,
          age: formData.age ? Number(formData.age) : undefined,
        });
        setEditMember(null);
      } else {
        await api.createAdminMember({
          ...formData,
          age: formData.age ? Number(formData.age) : undefined,
        });
        setIsAddModalOpen(false);
      }
      loadMembers();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ في حفظ بيانات المشترك');
    }
  };

  // Quick Renew Member
  const handleQuickRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewMember) return;
    setSubmittingRenew(true);
    try {
      await api.renewAdminMember(renewMember.id, {
        plan_name: renewPlan || renewMember.plan_name,
        duration_months: renewMonths,
        custom_end_date: customEndDate || undefined,
      });
      setRenewMember(null);
      loadMembers();
    } catch (err: any) {
      alert(err.message || 'فشل تجديد الاشتراك');
    } finally {
      setSubmittingRenew(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async (id: number) => {
    try {
      await api.deleteAdminMember(id);
      setDeleteConfirmId(null);
      loadMembers();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف المشترك');
    }
  };

  // Calculate statistics
  const activeCount = members.filter((m) => m.status === 'active').length;
  const expiringCount = members.filter((m) => m.status === 'expiring').length;
  const expiredCount = members.filter((m) => m.status === 'expired').length;
  const inactiveCount = members.filter((m) => m.status === 'inactive').length;

  return (
    <div className="space-y-6">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-heading flex items-center gap-2.5">
            <Users className="w-7 h-7 text-red-500" />
            <span>إدارة المشتركين والأعضاء</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            التحكم الكامل في بيانات المشتركين، متابعة تواريخ الاشتراكات، والتجديد الفوري
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadMembers}
            className="p-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مشترك جديد</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#111117] border border-neutral-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">إجمالي المشتركين</span>
            <Users className="w-4 h-4 text-neutral-500" />
          </div>
          <span className="text-2xl font-black text-white block mt-2 font-heading">
            {members.length}
          </span>
        </div>

        <div className="p-4 bg-[#111117] border border-emerald-900/30 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400">اشتراكات نشطة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-emerald-400 block mt-2 font-heading">
            {activeCount}
          </span>
        </div>

        <div className="p-4 bg-[#111117] border border-amber-900/30 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400">قاربت على الانتهاء</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-400 block mt-2 font-heading">
            {expiringCount}
          </span>
        </div>

        <div className="p-4 bg-[#111117] border border-red-900/30 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-400">اشتراكات منتهية</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-2xl font-black text-red-400 block mt-2 font-heading">
            {expiredCount}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-[#111117] border border-neutral-800 rounded-2xl">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold scrollbar-none">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'active', label: 'نشط' },
            { id: 'expiring', label: 'قارب على الانتهاء' },
            { id: 'expired', label: 'منتهي' },
            { id: 'inactive', label: 'غير مشترك' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، الهاتف، الباقة..."
            className="w-full bg-[#181822] border border-neutral-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-600"
          />
        </form>
      </div>

      {/* Members Table */}
      <div className="bg-[#111117] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400">
                <th className="py-3 px-4 font-bold">المشترك</th>
                <th className="py-3 px-4 font-bold">رقم الهاتف</th>
                <th className="py-3 px-4 font-bold">الباقة الحالية</th>
                <th className="py-3 px-4 font-bold">فترة الاشتراك</th>
                <th className="py-3 px-4 font-bold">الحالة والمتبقي</th>
                <th className="py-3 px-4 font-bold text-center">إجراءات الإدارة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>جاري تحميل بيانات المشتركين...</span>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    لا يوجد مشتركون مطابقون للمعايير الحالية
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const daysLeft = m.days_left ?? 0;
                  return (
                    <tr key={m.id} className="hover:bg-neutral-900/40 transition-colors">
                      {/* Name & Age */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-600/10 border border-red-500/30 text-red-500 font-bold flex items-center justify-center shrink-0">
                            {m.full_name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{m.full_name}</span>
                            <span className="text-[11px] text-neutral-500">
                              {m.age ? `${m.age} سنة` : 'العمر غير محدد'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone & Email */}
                      <td className="py-3.5 px-4 font-mono text-neutral-300">
                        <div>{m.phone}</div>
                        {m.email && (
                          <div className="text-[10px] text-neutral-500">{m.email}</div>
                        )}
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-neutral-200">
                          {m.plan_name || '—'}
                        </span>
                        {m.fitness_goal && (
                          <span className="block text-[10px] text-neutral-500 truncate max-w-[140px]">
                            {m.fitness_goal}
                          </span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400">
                        {m.start_date && m.end_date ? (
                          <div>
                            <span>من: {m.start_date}</span>
                            <span className="block text-red-400">إلى: {m.end_date}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-600">غير مسجل</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {m.status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>نشط ({daysLeft} يوم)</span>
                          </span>
                        )}
                        {m.status === 'expiring' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>ينتهي قريباً ({daysLeft} أيام)</span>
                          </span>
                        )}
                        {m.status === 'expired' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            <ShieldAlert className="w-3 h-3" />
                            <span>منتهي</span>
                          </span>
                        )}
                        {m.status === 'inactive' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
                            <span>غير مشترك</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Coach Chat & Workout Plans */}
                          <button
                            onClick={() => setCoachModalMember(m)}
                            className="px-2.5 py-1.5 bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="المحادثة المباشرة وإرسال خطة تدريبية"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">الخطط والرسائل</span>
                          </button>

                          {/* Quick Renew Button */}
                          <button
                            onClick={() => {
                              setRenewMember(m);
                              setRenewPlan(m.plan_name || 'الباقة الشهرية الأساسية (BASIC)');
                              setRenewMonths(1);
                              setCustomEndDate('');
                            }}
                            className="px-2.5 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="تجديد الاشتراك"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">تجديد</span>
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="تعديل البيانات الكاملة"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmId(m.id)}
                            className="p-1.5 bg-neutral-800 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="حذف الحساب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: ADD / EDIT MEMBER ================= */}
      {(isAddModalOpen || editMember) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0e0e13] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-right my-8">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditMember(null);
              }}
              className="absolute top-5 left-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white font-heading mb-4">
              {editMember ? 'تعديل بيانات المشترك والاشتراك' : 'إضافة مشترك جديد للمنظومة'}
            </h2>

            <form onSubmit={handleSaveMember} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-[#14141a] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">العمر</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    {editMember ? 'تغيير كلمة المرور (اختياري)' : 'كلمة المرور'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editMember ? 'اتركه فارغاً للإبقاء عليها' : '6 أحرف على الأقل'}
                    className="w-full bg-[#14141a] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Is Subscribed Toggle */}
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">حالة الاشتراك في الجيم</span>
                  <span className="text-[10px] text-neutral-400">هل المشترك يملك باقة مفعلة حالياً؟</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_subscribed: 1 })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      formData.is_subscribed ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    نعم
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_subscribed: 0 })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      !formData.is_subscribed ? 'bg-neutral-700 text-white' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    لا
                  </button>
                </div>
              </div>

              {formData.is_subscribed === 1 && (
                <div className="space-y-3 p-3 bg-red-950/20 border border-red-900/40 rounded-xl">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">نوع باقة الاشتراك</label>
                    <input
                      type="text"
                      value={formData.plan_name}
                      onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                      className="w-full bg-[#101016] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">تاريخ البدء</label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full bg-[#101016] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">تاريخ الانتهاء</label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full bg-[#101016] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">ملاحظات الإدارة</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات سرية للإدارة..."
                  className="w-full bg-[#14141a] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ البيانات</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditMember(null);
                  }}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUICK RENEW ================= */}
      {renewMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0e0e13] border border-neutral-800 rounded-3xl p-6 shadow-2xl text-right">
            <button
              onClick={() => setRenewMember(null)}
              className="absolute top-5 left-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-lg mb-2">
              <RotateCw className="w-5 h-5" />
              <span>تجديد اشتراك: {renewMember.full_name}</span>
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              اختر مدة التمديد، وسيقوم النظام بتحديث تاريخ الانتهاء تلقائياً وإرسال إشعار التجديد.
            </p>

            <form onSubmit={handleQuickRenew} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">باقة الاشتراك</label>
                <input
                  type="text"
                  value={renewPlan}
                  onChange={(e) => setRenewPlan(e.target.value)}
                  className="w-full bg-[#14141a] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">مدة التجديد السريع</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '+1 شهر', m: 1 },
                    { label: '+3 أشهر', m: 3 },
                    { label: '+6 أشهر', m: 6 },
                    { label: '+سنة', m: 12 },
                  ].map((dur) => (
                    <button
                      key={dur.m}
                      type="button"
                      onClick={() => {
                        setRenewMonths(dur.m);
                        setCustomEndDate('');
                      }}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        renewMonths === dur.m && !customEndDate
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  أو تحديد تاريخ انتهاء مخصص
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full bg-[#14141a] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submittingRenew}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <RotateCw className={`w-4 h-4 ${submittingRenew ? 'animate-spin' : ''}`} />
                  <span>تأكيد التجديد وتفعيل الاشتراك</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRenewMember(null)}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CONFIRM DELETE MODAL ================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#121218] border border-neutral-800 rounded-2xl p-6 text-center space-y-4">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-white">تأكيد حذف المشترك</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              هل أنت متأكد من حذف هذا المشترك نهائياً من سجلات النادي؟ لن يتمكن من تسجيل الدخول بعد الآن.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleDeleteMember(deleteConfirmId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs cursor-pointer"
              >
                تأكيد الحذف
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2 rounded-xl text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= COACH CHAT & WORKOUT PLANS MODAL ================= */}
      <AdminCoachModal
        isOpen={!!coachModalMember}
        onClose={() => {
          setCoachModalMember(null);
          loadMembers();
        }}
        member={coachModalMember}
      />
    </div>
  );
};

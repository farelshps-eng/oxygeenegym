import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Flame,
  Users,
  CreditCard,
  Building,
  Calendar,
  ShoppingBag,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { DashboardStats } from '../../types';
import { api } from '../../services/api';
import { AdminTab } from '../AdminLayout';

interface AdminDashboardHomeProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const countCards = [
    { label: 'إجمالي المشتركين', count: stats?.counts.totalMembers || 0, icon: UserCheck, tab: 'members' as AdminTab, color: 'text-red-500' },
    { label: 'إجمالي المعدات', count: stats?.counts.equipment || 0, icon: Dumbbell, tab: 'equipment' as AdminTab, color: 'text-red-500' },
    { label: 'إجمالي التمارين', count: stats?.counts.training || 0, icon: Flame, tab: 'training' as AdminTab, color: 'text-orange-500' },
    { label: 'إجمالي المدربين', count: stats?.counts.trainers || 0, icon: Users, tab: 'trainers' as AdminTab, color: 'text-blue-500' },
    { label: 'باقات الاشتراك', count: stats?.counts.memberships || 0, icon: CreditCard, tab: 'memberships' as AdminTab, color: 'text-emerald-500' },
    { label: 'إجمالي المرافق', count: stats?.counts.facilities || 0, icon: Building, tab: 'facilities' as AdminTab, color: 'text-purple-500' },
    { label: 'الأخبار والفعاليات', count: stats?.counts.news || 0, icon: Calendar, tab: 'news' as AdminTab, color: 'text-yellow-500' },
    { label: 'كتالوج المنتجات', count: stats?.counts.products || 0, icon: ShoppingBag, tab: 'products' as AdminTab, color: 'text-pink-500' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-[#0f0f13] border border-neutral-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-red-500 tracking-wider uppercase block mb-1">
            لوحة الإدارة الرئيسية
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white">
            مرحباً بك في نظام إدارة OXYGEN GYM
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            تحكم كامل في المشتركين، المعدات، التمارين، المدربين، باقات الاشتراك، الأخبار والمنتجات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('members')}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/40"
          >
            <UserCheck className="w-4 h-4" />
            <span>إدارة المشتركين</span>
          </button>
          <button
            onClick={() => onNavigateTab('equipment')}
            className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة معدة</span>
          </button>
        </div>
      </div>

      {/* Member Alerts & Status Quick Bar */}
      <div className="p-5 bg-gradient-to-r from-[#171722] via-[#121219] to-[#0a0a0e] border border-neutral-800 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="text-sm font-bold text-white">نظام متابعة اشتراكات الأعضاء</h3>
              <p className="text-[11px] text-neutral-400">متابعة الاشتراكات النشطة، المنتهية، والقريبة من الانتهاء</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('members')}
            className="text-xs text-red-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>فتح المنظومة الكاملة</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl">
            <span className="text-[10px] text-neutral-400 block">إجمالي الأعضاء</span>
            <span className="text-xl font-black text-white font-heading mt-0.5 block">
              {stats?.counts.totalMembers ?? 0}
            </span>
          </div>
          <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl">
            <span className="text-[10px] text-emerald-400 block">اشتراكات نشطة</span>
            <span className="text-xl font-black text-emerald-400 font-heading mt-0.5 block">
              {stats?.counts.activeMembers ?? 0}
            </span>
          </div>
          <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl">
            <span className="text-[10px] text-amber-400 block">قارب على الانتهاء</span>
            <span className="text-xl font-black text-amber-400 font-heading mt-0.5 block">
              {stats?.counts.expiringMembers ?? 0}
            </span>
          </div>
          <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl">
            <span className="text-[10px] text-red-400 block">اشتراكات منتهية</span>
            <span className="text-xl font-black text-red-400 font-heading mt-0.5 block">
              {stats?.counts.expiredMembers ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Unread messages banner if any */}
      {(stats?.counts.unreadMessages || 0) > 0 && (
        <div
          onClick={() => onNavigateTab('messages')}
          className="p-4 bg-red-950/30 border border-red-900/60 rounded-xl flex items-center justify-between cursor-pointer hover:bg-red-950/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-red-400" />
            <div>
              <span className="text-sm font-bold text-white">
                لديك {stats?.counts.unreadMessages} رسائل تواصل جديدة غير مقروءة!
              </span>
              <p className="text-xs text-neutral-400">انقر هنا لعرض صندوق رسائل واستفسارات الزوار</p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-red-400" />
        </div>
      )}

      {/* Stat Count Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {countCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(card.tab)}
              className="p-5 bg-[#0f0f13] border border-neutral-800 rounded-xl hover:border-neutral-700 hover:bg-[#14141a] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-400 group-hover:text-white transition-colors">
                  {card.label}
                </span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black font-heading text-white tabular-nums">
                  {loading ? '...' : card.count}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="bg-[#0f0f13] border border-neutral-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-red-500" />
              <span>آخر المشتركين المسجلين</span>
            </h3>
            <button
              onClick={() => onNavigateTab('members')}
              className="text-xs text-red-400 hover:text-white"
            >
              عرض الكل
            </button>
          </div>

          <div className="space-y-2">
            {stats?.recent.members && stats.recent.members.length > 0 ? (
              stats.recent.members.map((m: any) => (
                <div
                  key={m.id}
                  className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white">{m.full_name}</h4>
                    <span className="text-neutral-500">{m.phone} · {m.plan_name || 'بدون باقة'}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      m.status === 'active'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40'
                        : m.status === 'expiring'
                        ? 'bg-amber-950 text-amber-400 border border-amber-900/40'
                        : 'bg-red-950 text-red-400 border border-red-900/40'
                    }`}
                  >
                    {m.status === 'active' ? 'نشط' : m.status === 'expiring' ? 'يقترب الانتهاء' : 'منتهي'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 py-4 text-center">لا يوجد مشتركون مسجلون بعد.</p>
            )}
          </div>
        </div>

        {/* Recent Equipment */}
        <div className="bg-[#0f0f13] border border-neutral-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-red-500" />
              <span>آخر المعدات المضافة</span>
            </h3>
            <button
              onClick={() => onNavigateTab('equipment')}
              className="text-xs text-red-400 hover:text-white"
            >
              عرض الكل
            </button>
          </div>

          <div className="space-y-2">
            {stats?.recent.equipment && stats.recent.equipment.length > 0 ? (
              stats.recent.equipment.map((eq: any) => (
                <div
                  key={eq.id}
                  className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white">{eq.name}</h4>
                    <span className="text-neutral-500">{eq.category_name || 'عام'}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      eq.is_published
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {eq.is_published ? 'منشورة' : 'مخفية'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 py-4 text-center">لا توجد معدات مضافة بعد.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

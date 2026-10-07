import React, { useState } from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Dumbbell,
  Flame,
  Users,
  CreditCard,
  Building,
  Calendar,
  ShoppingBag,
  Image as ImageIcon,
  MessageSquare,
  Tags,
  Share2,
  Settings,
  KeyRound,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { User } from '../types';
import { clearAuthToken } from '../services/api';
import { GymLogo } from '../components/GymLogo';

export type AdminTab =
  | 'dashboard'
  | 'members'
  | 'equipment'
  | 'training'
  | 'trainers'
  | 'memberships'
  | 'facilities'
  | 'news'
  | 'products'
  | 'media'
  | 'messages'
  | 'categories'
  | 'social'
  | 'settings'
  | 'password';

interface AdminLayoutProps {
  user: User;
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  onViewPublicSite: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  activeTab,
  onSelectTab,
  onLogout,
  onViewPublicSite,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'members', label: 'المشتركين والأعضاء', icon: UserCheck },
    { id: 'equipment', label: 'المعدات', icon: Dumbbell },
    { id: 'training', label: 'التمارين والرياضات', icon: Flame },
    { id: 'trainers', label: 'المدربين', icon: Users },
    { id: 'memberships', label: 'الاشتراكات والأسعار', icon: CreditCard },
    { id: 'facilities', label: 'المرافق', icon: Building },
    { id: 'news', label: 'الأخبار والفعاليات', icon: Calendar },
    { id: 'products', label: 'المنتجات', icon: ShoppingBag },
    { id: 'media', label: 'مكتبة الصور والوسائط', icon: ImageIcon },
    { id: 'messages', label: 'رسائل التواصل', icon: MessageSquare },
    { id: 'categories', label: 'إدارة التصنيفات', icon: Tags },
    { id: 'social', label: 'الروابط الاجتماعية', icon: Share2 },
    { id: 'settings', label: 'إعدادات الموقع', icon: Settings },
    { id: 'password', label: 'الأمان وكلمة المرور', icon: KeyRound },
  ];

  const handleTabClick = (tab: AdminTab) => {
    onSelectTab(tab);
    setMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    clearAuthToken();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-100 flex flex-col lg:flex-row antialiased">
      {/* Mobile Top Header */}
      <div className="lg:hidden h-16 bg-[#0f0f13] border-b border-neutral-800 px-4 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" />
          <span className="font-heading font-black text-sm tracking-wider uppercase text-white">
            OXYGEN ADMIN
          </span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-neutral-400 hover:text-white rounded-lg bg-neutral-800/60"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-72 bg-[#0f0f13] border-l border-neutral-800 flex flex-col justify-between z-40 transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand header */}
          <div className="p-5 border-b border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GymLogo size="sm" />
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-start ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-950/40 font-bold'
                      : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-neutral-800/80 space-y-2 bg-[#0d0d11]">
          <button
            onClick={onViewPublicSite}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>عرض الموقع العام</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 text-xs font-semibold transition-colors cursor-pointer border border-red-900/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

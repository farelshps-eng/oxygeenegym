import React, { useState } from 'react';
import {
  Menu,
  X,
  ChevronDown,
  Globe,
  Shield,
  Search,
  MapPin,
  User,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Bell,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SiteSettings, Member, MemberNotification } from '../types';
import { GymLogo } from './GymLogo';
import { GymLiveStatus } from './GymLiveStatus';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenSubscribe: () => void;
  settings?: SiteSettings;
  currentMember?: Member | null;
  memberNotifications?: MemberNotification[];
  onOpenMemberAuth: (mode?: 'login' | 'register') => void;
  onOpenMemberProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenSubscribe,
  settings,
  currentMember,
  memberNotifications = [],
  onOpenMemberAuth,
  onOpenMemberProfile,
}) => {
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const mainNavItems = [
    { id: 'home', labelAr: 'الرئيسية', labelEn: 'Home' },
    { id: 'guide', labelAr: 'دليل الموقع 💡', labelEn: 'Site Guide 💡' },
    { id: 'equipment', labelAr: 'المعدات', labelEn: 'Equipment' },
    { id: 'training', labelAr: 'التمارين', labelEn: 'Training' },
    { id: 'trainers', labelAr: 'المدربين', labelEn: 'Trainers' },
    { id: 'memberships', labelAr: 'الاشتراكات', labelEn: 'Memberships' },
    { id: 'facilities', labelAr: 'المرافق', labelEn: 'Facilities' },
  ];

  const secondaryNavItems = [
    { id: 'news', labelAr: 'الأخبار', labelEn: 'News' },
    { id: 'products', labelAr: 'المنتجات', labelEn: 'Products' },
    { id: 'about', labelAr: 'عن الجيم', labelEn: 'About' },
    { id: 'location', labelAr: 'الموقع', labelEn: 'Location' },
    { id: 'contact', labelAr: 'تواصل معنا', labelEn: 'Contact' },
    { id: 'gallery', labelAr: 'الصور', labelEn: 'Gallery' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const urgentNotificationsCount = memberNotifications.filter((n) => n.urgent).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08080ceb] backdrop-blur-md border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Gym Brand Logo & Live Hours */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 group text-start shrink-0 cursor-pointer"
          >
            <GymLogo size="sm" />
          </button>
          <div className="hidden xl:block">
            <GymLiveStatus variant="compact" />
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-300">
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`transition-colors whitespace-nowrap cursor-pointer py-1 relative ${
                currentTab === item.id
                  ? 'text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t(item.labelAr, item.labelEn)}
              {currentTab === item.id && (
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
              )}
            </button>
          ))}

          {/* More Dropdown for secondary pages */}
          <div className="relative">
            <button
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              className="flex items-center gap-1 py-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>{t('المزيد', 'More')}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  moreDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {moreDropdownOpen && (
              <div
                className="absolute top-full mt-2 w-48 bg-[#111115] border border-neutral-800 rounded-lg shadow-2xl py-2 z-50 animate-fadeIn"
                onMouseLeave={() => setMoreDropdownOpen(false)}
              >
                {secondaryNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-start px-4 py-2 text-xs transition-colors cursor-pointer ${
                      currentTab === item.id
                        ? 'text-red-400 bg-neutral-900 font-semibold'
                        : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
                    }`}
                  >
                    {t(item.labelAr, item.labelEn)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Global Search icon button */}
          <button
            onClick={() => handleNavClick('search')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              currentTab === 'search'
                ? 'text-red-500 bg-neutral-800'
                : 'text-neutral-400 hover:text-white'
            }`}
            title={t('بحث عام في الجيم', 'Search Oxygen Gym')}
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </nav>

        {/* Zone 3: Actions & Member Profile/Login */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Member Account / Login Button */}
          {currentMember ? (
            <button
              onClick={onOpenMemberProfile}
              className="flex items-center gap-2 px-2.5 py-1.5 min-h-[42px] rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-500/50 active:scale-95 transition-all cursor-pointer group text-start relative touch-manipulation"
              title="الملف الرياضي وبطاقة العضوية"
            >
              {/* Member Avatar / Initial */}
              <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 font-bold flex items-center justify-center text-xs shrink-0">
                {currentMember.full_name.charAt(0)}
              </div>

              {/* Name & status */}
              <div className="hidden sm:block text-xs leading-none">
                <span className="font-bold text-white block group-hover:text-red-400 transition-colors">
                  {currentMember.full_name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                  {currentMember.status === 'active' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                  {currentMember.status === 'expiring' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  )}
                  {currentMember.status === 'expired' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                  <span>
                    {currentMember.status === 'active'
                      ? `${currentMember.days_left ?? 0} يوماً`
                      : currentMember.status === 'expiring'
                      ? 'قارب الانتهاء'
                      : currentMember.status === 'expired'
                      ? 'منتهي'
                      : 'حسابي'}
                  </span>
                </span>
              </div>

              {/* Alert Badge if urgent notifications exist */}
              {urgentNotificationsCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 absolute -top-1 -right-1 ring-2 ring-[#08080c] animate-pulse" />
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenMemberAuth('login')}
                className="flex items-center gap-1 px-3 py-2 min-h-[42px] text-xs font-bold text-neutral-300 hover:text-white bg-neutral-900/90 hover:bg-neutral-800 active:scale-95 border border-neutral-800 rounded-xl transition-all cursor-pointer touch-manipulation"
              >
                <User className="w-3.5 h-3.5 text-red-500" />
                <span className="hidden sm:inline">تسجيل الدخول</span>
                <span className="sm:hidden">دخول</span>
              </button>

              <button
                onClick={() => onOpenMemberAuth('register')}
                className="hidden md:flex items-center gap-1 px-3 py-2 min-h-[42px] text-xs font-bold text-neutral-400 hover:text-white border border-neutral-800/80 active:scale-95 rounded-xl transition-all cursor-pointer hover:bg-neutral-900 touch-manipulation"
              >
                <span>إنشاء حساب</span>
              </button>
            </div>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 px-2.5 py-2 min-h-[42px] text-xs font-medium text-neutral-400 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 active:scale-95 border border-neutral-800 rounded-xl transition-colors cursor-pointer touch-manipulation"
            title={t('تغيير اللغة', 'Change Language')}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="font-sans uppercase text-[11px]">{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          <button
            onClick={() => handleNavClick('admin')}
            className="p-2 min-h-[42px] min-w-[42px] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 active:scale-95 rounded-xl border border-neutral-800 transition-colors cursor-pointer touch-manipulation"
            title="لوحة الإدارة"
            aria-label="Admin"
          >
            <Shield className="w-4 h-4 text-red-500/80" />
          </button>

          {/* Primary CTA (In-Gym Subscription Info) */}
          <button
            onClick={onOpenSubscribe}
            className="hidden sm:flex px-4 py-2 min-h-[42px] text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl transition-all shadow-md shadow-red-950/40 whitespace-nowrap cursor-pointer items-center gap-1.5 touch-manipulation"
          >
            <span>{t('اشترك في الجيم', 'Join The Gym')}</span>
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 min-h-[42px] min-w-[42px] flex items-center justify-center text-neutral-300 hover:text-white rounded-xl hover:bg-neutral-800 active:scale-90 transition-colors cursor-pointer touch-manipulation"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-800 bg-[#0d0d12] px-4 py-4 space-y-3 animate-fadeIn">
          {/* Live Hours in Mobile Menu */}
          <div className="flex justify-center pb-1">
            <GymLiveStatus variant="compact" />
          </div>

          {/* Member Card / Register in Mobile Drawer */}
          {currentMember ? (
            <div
              onClick={() => {
                onOpenMemberProfile();
                setMobileMenuOpen(false);
              }}
              className="p-3 bg-[#15151e] border border-neutral-700/80 rounded-2xl flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 font-bold flex items-center justify-center text-xs">
                  {currentMember.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{currentMember.full_name}</h4>
                  <span className="text-[11px] text-neutral-400">
                    {currentMember.plan_name || 'حساب رياضي'} · {currentMember.days_left ?? 0} يوماً متبقية
                  </span>
                </div>
              </div>
              <span className="text-xs text-red-400 font-bold">بطاقتي</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onOpenMemberAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-white text-center cursor-pointer"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => {
                  onOpenMemberAuth('register');
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 px-3 bg-red-600 rounded-xl text-xs font-bold text-white text-center cursor-pointer shadow-md shadow-red-950/40"
              >
                إنشاء حساب
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {[...mainNavItems, ...secondaryNavItems].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-start px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer ${
                  currentTab === item.id
                    ? 'text-white bg-red-600/20 font-bold border-r-2 border-red-500'
                    : 'text-neutral-300 hover:bg-neutral-800/80'
                }`}
              >
                {t(item.labelAr, item.labelEn)}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <button
              onClick={() => handleNavClick('search')}
              className="flex items-center gap-1.5 hover:text-white cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-red-500" />
              <span>{t('البحث العام', 'Search')}</span>
            </button>

            <button
              onClick={onOpenSubscribe}
              className="text-red-400 font-bold hover:text-red-300 cursor-pointer"
            >
              <span>{t('الاشتراك داخل الجيم', 'In-Gym Membership')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

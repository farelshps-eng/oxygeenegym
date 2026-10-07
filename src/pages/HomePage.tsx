import React from 'react';
import {
  Dumbbell,
  Flame,
  Users,
  CreditCard,
  Building,
  ShoppingBag,
  MapPin,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { GymLiveStatus } from '../components/GymLiveStatus';
import { FitnessCalculator } from '../components/FitnessCalculator';
import {
  SiteSettings,
  Equipment,
  Training,
  Trainer,
  Membership,
  Facility,
  NewsItem,
  Product,
} from '../types';
import { GymLogo } from '../components/GymLogo';
import { DEFAULT_IMAGES, resolveImageUrl } from '../lib/media';

interface HomePageProps {
  onNavigate: (tab: string, extra?: any) => void;
  onOpenSubscribe: (planName?: string) => void;
  onOpenInquiry: (product: Product) => void;
  settings?: SiteSettings;
  featuredEquipment: Equipment[];
  featuredTraining: Training[];
  featuredMemberships: Membership[];
  facilities: Facility[];
  latestNews: NewsItem[];
  featuredProducts: Product[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenSubscribe,
  onOpenInquiry,
  settings,
  featuredEquipment,
  featuredTraining,
  featuredMemberships,
  facilities,
  latestNews,
  featuredProducts,
}) => {
  const { t, isRtl } = useLanguage();

  const heroImage = resolveImageUrl(settings?.hero_image, DEFAULT_IMAGES.hero);

  const showStats = settings?.show_stats !== '0' && (settings?.stat_equipment || settings?.stat_area);

  return (
    <div className="space-y-20 lg:space-y-28 pb-20">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with High-Contrast Dark Gradient Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="OXYGEN GYM Tripoli"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-50 contrast-125 scale-105 animate-pulse duration-[10000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/70 to-black/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/20 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center space-y-8">
          {/* Gym Logo Emblem */}
          <div className="flex justify-center mb-1">
            <GymLogo size="xl" showText={false} />
          </div>

          {/* Subtle Location & Live Status Kicker */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <GymLiveStatus variant="compact" />
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900/80 border border-neutral-700/60 rounded-full text-xs text-neutral-300 backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>{settings?.address || 'طريق عين زارة، طرابلس، ليبيا'}</span>
              <span className="text-neutral-500">·</span>
              <span className="font-mono text-neutral-400">Plus Code: {settings?.plus_code || 'R84G+X2P'}</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-heading tracking-tight text-white leading-tight text-balance">
            {settings?.hero_title || 'تنفّس القوة. اصنع الفرق.'}
          </h1>

          {/* Supporting text */}
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-neutral-300 leading-relaxed font-light">
            {settings?.hero_description ||
              'كل ما تحتاجه لتدريب أقوى، لياقة أفضل، ورحلة مستمرة نحو أهدافك في صالة متكاملة بأعلى المواصفات العالمية.'}
          </p>

          {/* Hero Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                const el = document.getElementById('quick-access');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-7 py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-sm sm:text-base rounded-lg transition-all shadow-xl shadow-red-950/60 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{t('استكشف الجيم', 'Explore Gym')}</span>
              {isRtl ? <ArrowRight className="w-4 h-4 rotate-180" /> : <ArrowRight className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onNavigate('guide')}
              className="w-full sm:w-auto px-6 py-3.5 bg-neutral-900/90 hover:bg-neutral-800 border border-amber-500/40 hover:border-amber-500 active:scale-95 text-neutral-100 font-bold text-sm sm:text-base rounded-lg transition-all backdrop-blur-sm cursor-pointer flex items-center justify-center gap-2 group"
            >
              <Compass className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
              <span>{t('دليل الموقع والشرح 💡', 'Site Guide 💡')}</span>
            </button>

            <button
              onClick={() => onNavigate('location')}
              className="w-full sm:w-auto px-6 py-3.5 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 active:scale-95 text-neutral-100 font-semibold text-sm sm:text-base rounded-lg transition-all backdrop-blur-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-red-500" />
              <span>{t('موقعنا في طرابلس', 'Our Location')}</span>
            </button>
          </div>

          {/* Bottom Physical Notice */}
          <div className="pt-6">
            <p className="text-xs text-neutral-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{t('الاشتراك والتسجيل يتم حضوريًا داخل صالة أوكسجين جيم', 'Membership registration is completed in person at Oxygen Gym')}</span>
            </p>
          </div>
        </div>
      </section>

      {/* 2. QUICK ACCESS CARDS */}
      <section id="quick-access" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
            {t('أقسام النادي الرئيسية', 'Main Sections')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
            {t('كل ما يقدمه أوكسجين جيم', 'Everything at Oxygen Gym')}
          </h2>
        </div>

        {/* Interactive Guide Banner */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#12121a] to-neutral-900 border border-red-600/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5 text-start">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-950/50">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {t('دليل أوكسجين الشامل للزوار والمشتركين', 'Comprehensive Visitor & Member Guide')}
                </h4>
                <span className="px-2 py-0.5 bg-red-600/30 text-red-300 border border-red-500/40 rounded-full text-[10px] font-bold">
                  جديد 💡
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {t(
                  'تعرف على كيفية استخدام كامل الموقع، استكشاف الأجهزة، متابعة اشتراكك والتواصل مع المدرب كابتن وليد.',
                  'Explore how to use all features, track your membership, and chat with Coach Waleed.'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onNavigate('guide');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all whitespace-nowrap cursor-pointer shadow-lg shadow-red-950/40 flex items-center justify-center gap-2"
          >
            <span>{t('تصفح دليل الموقع', 'Explore Guide')}</span>
            {isRtl ? <ArrowRight className="w-3.5 h-3.5 rotate-180" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Equipment */}
          <button
            onClick={() => onNavigate('equipment')}
            className="group p-6 rounded-xl bg-[#0f0f13] border border-neutral-800/80 hover:border-red-600/50 hover:bg-[#14141a] transition-all text-start cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-red-600/10 border border-red-600/20 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                {t('المعدات', 'Equipment')}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {t('استكشف المعدات المتوفرة في الجيم.', 'Explore high-end workout machinery and free weights available in the gym.')}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-neutral-400 group-hover:text-white">
              <span>{t('استكشف المعدات', 'Explore Equipment')}</span>
              {isRtl ? <ChevronRight className="w-4 h-4 rotate-180" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </button>

          {/* Card 2: Training */}
          <button
            onClick={() => onNavigate('training')}
            className="group p-6 rounded-xl bg-[#0f0f13] border border-neutral-800/80 hover:border-red-600/50 hover:bg-[#14141a] transition-all text-start cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-red-600/10 border border-red-600/20 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                {t('التمارين', 'Training')}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {t('اكتشف أنواع التدريبات والرياضات.', 'Discover training programs, boxing, martial arts, and cardio disciplines.')}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-neutral-400 group-hover:text-white">
              <span>{t('عرض التمارين', 'View Training')}</span>
              {isRtl ? <ChevronRight className="w-4 h-4 rotate-180" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </button>

          {/* Card 3: Trainers */}
          <button
            onClick={() => onNavigate('trainers')}
            className="group p-6 rounded-xl bg-[#0f0f13] border border-neutral-800/80 hover:border-red-600/50 hover:bg-[#14141a] transition-all text-start cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-red-600/10 border border-red-600/20 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                {t('المدربين', 'Trainers')}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {t('تعرف على المدربين وتخصصاتهم.', 'Meet certified fitness coaches, personal trainers, and fight instructors.')}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-neutral-400 group-hover:text-white">
              <span>{t('تعرف على المدربين', 'Meet Trainers')}</span>
              {isRtl ? <ChevronRight className="w-4 h-4 rotate-180" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </button>

          {/* Card 4: Memberships */}
          <button
            onClick={() => onNavigate('memberships')}
            className="group p-6 rounded-xl bg-[#0f0f13] border border-neutral-800/80 hover:border-red-600/50 hover:bg-[#14141a] transition-all text-start cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-red-600/10 border border-red-600/20 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                {t('الاشتراكات', 'Memberships')}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {t('اطلع على الباقات والأسعار.', 'Browse membership plans and prices. Subscriptions are completed in-gym.')}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-neutral-400 group-hover:text-white">
              <span>{t('استعراض الباقات', 'View Plans')}</span>
              {isRtl ? <ChevronRight className="w-4 h-4 rotate-180" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </button>

          {/* Card 5: Facilities */}
          <button
            onClick={() => onNavigate('facilities')}
            className="group p-6 rounded-xl bg-[#0f0f13] border border-neutral-800/80 hover:border-red-600/50 hover:bg-[#14141a] transition-all text-start cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-red-600/10 border border-red-600/20 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                {t('المرافق', 'Facilities')}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {t('تعرف على الخدمات والمرافق المتوفرة.', 'Explore locker rooms, showers, wellness amenities, and specialized zones.')}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-neutral-400 group-hover:text-white">
              <span>{t('اكتشف المرافق', 'Explore Facilities')}</span>
              {isRtl ? <ChevronRight className="w-4 h-4 rotate-180" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </button>

          {/* Card 6: Products */}
          <button
            onClick={() => onNavigate('products')}
            className="group p-6 rounded-xl bg-[#0f0f13] border border-neutral-800/80 hover:border-red-600/50 hover:bg-[#14141a] transition-all text-start cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-red-600/10 border border-red-600/20 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                {t('المنتجات', 'Products')}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {t('تصفح المنتجات المعروضة في الجيم.', 'Catalog of supplements, nutrition, and fitness gear available at the gym store.')}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-neutral-400 group-hover:text-white">
              <span>{t('تصفح المنتجات', 'Browse Catalog')}</span>
              {isRtl ? <ChevronRight className="w-4 h-4 rotate-180" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </button>
        </div>
      </section>

      {/* 3. ABOUT OXYGEN GYM SECTION (Configurable via Admin) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#0f0f13] border border-neutral-800 rounded-2xl p-8 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
                {t('عن النادي', 'About Club')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-heading text-white">
                {settings?.about_title || 'عن OXYGEN GYM'}
              </h2>
              <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
                {settings?.about_text ||
                  t(
                    'نادي أوكسجين جيم هو صرح رياضي متكامل في طرابلس بطريق عين زارة. تم تجهيز النادي بأحدث المعدات الرياضية وأقوى التجهيزات العالمية لضمان تجربة تدريب احترافية وممتعة تناسب جميع المستويات، تحت إشراف نخبة من المدربين المعتمدين.',
                    'Oxygen Gym is a premier athletic fitness facility located on Ain Zara Road in Tripoli, Libya. Designed to empower athletes and fitness enthusiasts of all levels with top-tier equipment and certified coaching.'
                  )}
              </p>

              {/* Statistics (Configurable - hidden if none entered) */}
              {showStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-neutral-800/80">
                  {settings?.stat_equipment && (
                    <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800">
                      <span className="block text-2xl font-black font-heading text-white tabular-nums text-red-500">
                        {settings.stat_equipment}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {t('معدة وجهاز تدريب', 'Machines & Equipment')}
                      </span>
                    </div>
                  )}
                  {settings?.stat_area && (
                    <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800">
                      <span className="block text-2xl font-black font-heading text-white tabular-nums text-white">
                        {settings.stat_area}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {t('مساحة تدريب متكاملة', 'Training Area')}
                      </span>
                    </div>
                  )}
                  {settings?.stat_programs && (
                    <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800">
                      <span className="block text-2xl font-black font-heading text-white tabular-nums text-white">
                        {settings.stat_programs}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {t('برامج ورياضات', 'Programs & Sports')}
                      </span>
                    </div>
                  )}
                  {settings?.stat_coaches && (
                    <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800">
                      <span className="block text-2xl font-black font-heading text-white tabular-nums text-white">
                        {settings.stat_coaches}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {t('مدربون معتمدون', 'Certified Coaches')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => onNavigate('location')}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{t('طريق عين زارة، طرابلس', 'Ain Zara Road, Tripoli')}</span>
                </button>
              </div>
            </div>

            {/* Side visual banner */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-xl overflow-hidden border border-neutral-700/60 shadow-2xl relative aspect-[4/3]">
                <img
                  src={DEFAULT_IMAGES.facilities}
                  alt="Oxygen Gym Tripoli Facilities"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <div>
                    <span className="text-xs font-bold text-red-500 uppercase block">OXYGEN GYM</span>
                    <span className="text-base font-bold text-white">أعلى معايير النظافة والاحترافية الرياضية</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED EQUIPMENT SHOWCASE */}
      {featuredEquipment.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
                {t('أحدث التجهيزات', 'Top Equipment')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
                {t('معدات احترافية بمواصفات عالمية', 'Professional Gym Machinery')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('equipment')}
              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{t('عرض جميع المعدات', 'View All Equipment')}</span>
              {isRtl ? <ChevronRight className="w-4 h-4 rotate-180" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEquipment.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="group bg-[#0f0f13] border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-colors"
              >
                <div className="aspect-[4/3] bg-neutral-900 relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={resolveImageUrl(item.image_url, DEFAULT_IMAGES.equipment)}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                      <Dumbbell className="w-12 h-12" />
                    </div>
                  )}
                  {item.category_name && (
                    <span className="absolute top-3 right-3 text-[11px] font-bold px-2 py-0.5 rounded bg-black/70 text-neutral-200 backdrop-blur-sm border border-neutral-700/50">
                      {item.category_name}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                    <span className="text-xs text-neutral-500 font-mono">
                      {item.manufacturer || 'Oxygen Gym'}
                    </span>
                    <button
                      onClick={() => onNavigate('equipment', { slug: item.slug })}
                      className="text-xs font-semibold text-red-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {t('عرض التفاصيل', 'View Details')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. MEMBERSHIPS & HOW TO SUBSCRIBE (Strictly informational) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
            {t('باقات العضوية', 'Memberships')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-heading text-white">
            {t('الاشتراكات والأسعار', 'Membership Plans & Pricing')}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            {t(
              'اختر الباقة المناسبة لأهدافك. جميع الاشتراكات تسجل وتفعل حضوريًا من داخل مقر الجيم.',
              'Choose your plan. Subscriptions are activated and registered in person at the front desk.'
            )}
          </p>
        </div>

        {/* Membership Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {featuredMemberships.map((plan) => {
            let features: string[] = [];
            try {
              features = plan.features_json ? JSON.parse(plan.features_json) : [];
            } catch (e) {
              features = [];
            }

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all relative ${
                  plan.is_featured
                    ? 'bg-[#14141a] border-2 border-red-600 shadow-2xl shadow-red-950/40'
                    : 'bg-[#0f0f13] border border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {plan.is_featured === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-red-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider">
                    {t('الباقة الأكثر طلباً', 'Most Popular')}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold font-heading text-white">{plan.name}</h3>
                    <span className="text-xs text-red-400 font-semibold">{plan.duration}</span>
                  </div>

                  <div className="py-2 border-y border-neutral-800">
                    <span className="text-3xl sm:text-4xl font-black font-heading text-white tabular-nums">
                      {plan.price > 0 ? plan.price : t('حسب الطلب', 'Custom')}
                    </span>
                    <span className="text-xs text-neutral-400 mr-2 font-bold">{plan.currency}</span>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-neutral-400 leading-relaxed">{plan.description}</p>
                  )}

                  {/* Features List */}
                  {features.length > 0 && (
                    <ul className="space-y-2.5 pt-2">
                      {features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                          <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Strict CTA: "الاشتراك داخل الجيم" */}
                <div className="mt-8 pt-4 border-t border-neutral-800">
                  <button
                    onClick={() => onOpenSubscribe(plan.name)}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-xs sm:text-sm text-center transition-all cursor-pointer ${
                      plan.is_featured
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-950/40'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                    }`}
                  >
                    {t('الاشتراك داخل الجيم', 'Subscribe In-Gym')}
                  </button>
                  <span className="block text-[11px] text-neutral-400 text-center mt-2">
                    {t('التسجيل حضوريًا بمكتب الاستقبال', 'Registration in person at front desk')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* STEP-BY-STEP "كيف أشترك؟" Section */}
        <div className="bg-[#0f0f13] border border-neutral-800 rounded-2xl p-6 sm:p-10">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
              {t('إجراءات التسجيل', 'Registration Process')}
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-heading text-white mt-1">
              {t('كيف أشترك في أوكسجين جيم؟', 'How to Join Oxygen Gym?')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-start space-y-2">
              <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-500 font-bold text-xs flex items-center justify-center border border-red-600/30">
                1
              </span>
              <h4 className="text-sm font-bold text-white">
                {t('اختر الباقة المناسبة لك', '1. Select Your Plan')}
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {t(
                  'اطلع على تفاصيل الباقات والأسعار عبر هذه الصفحة واختر ما يلائم أهدافك الرياضية وجدولك.',
                  'Review membership options and choose the plan that best fits your training goals.'
                )}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-start space-y-2">
              <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-500 font-bold text-xs flex items-center justify-center border border-red-600/30">
                2
              </span>
              <h4 className="text-sm font-bold text-white">
                {t('توجه إلى مقر Oxygen Gym', '2. Visit Oxygen Gym')}
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {t(
                  'تفضل بزيارتنا في مقر النادي بطريق عين زارة، طرابلس (رمز الخرائط R84G+X2P).',
                  'Visit our location on Ain Zara Road in Tripoli (Google Maps Plus Code: R84G+X2P).'
                )}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-start space-y-2">
              <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-500 font-bold text-xs flex items-center justify-center border border-red-600/30">
                3
              </span>
              <h4 className="text-sm font-bold text-white">
                {t('قم بالاشتراك من داخل الجيم', '3. Subscribe In Person')}
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {t(
                  'سيتولى فريق الاستقبال تسجيل بياناتك واستلام بطاقة العضوية والبدء فوراً في تدريبك.',
                  'Our front desk will register your information, issue your membership card, and get you started.'
                )}
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('location')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-red-500" />
              <span>{t('اعرف موقعنا وافتح الخريطة', 'Get Directions & Map')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5.5 INTERACTIVE ATHLETIC & BMI CALCULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <FitnessCalculator
          onNavigateToMemberships={() => {
            const el = document.getElementById('quick-access');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onNavigateToTrainers={() => onNavigate('trainers')}
        />
      </section>

      {/* 6. TRAINING & SPORTS PREVIEW */}
      {featuredTraining.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
                {t('الرياضات والتدريبات', 'Sports & Training')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
                {t('تدريبات قتالية ولياقة بدنية مكثفة', 'Combat & Athletic Disciplines')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('training')}
              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{t('عرض جميع التمارين', 'Explore All Training')}</span>
              {isRtl ? <ChevronRight className="w-4 h-4 rotate-180" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredTraining.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden bg-[#0f0f13] border border-neutral-800 aspect-[16/9] flex items-end p-6"
              >
                <img
                  src={resolveImageUrl(item.image_url, DEFAULT_IMAGES.training)}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="relative z-10 space-y-2 max-w-xl">
                  {item.category_name && (
                    <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                      {item.category_name}
                    </span>
                  )}
                  <h3 className="text-xl sm:text-2xl font-bold text-white">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate('training', { slug: item.slug })}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      {t('اكتشف التمرين', 'Explore Training')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. LATEST NEWS & UPDATES */}
      {latestNews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
                {t('مستجدات أوكسجين', 'Gym Updates')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
                {t('آخر أخبار وفعاليات النادي', 'Latest News & Events')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('news')}
              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{t('عرض أرشيف الأخبار', 'View News Archive')}</span>
              {isRtl ? <ChevronRight className="w-4 h-4 rotate-180" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestNews.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="group bg-[#0f0f13] border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div className="aspect-[16/9] bg-neutral-900 relative overflow-hidden">
                  {item.cover_image ? (
                    <img
                      src={resolveImageUrl(item.cover_image, DEFAULT_IMAGES.hero)}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                      <Calendar className="w-10 h-10" />
                    </div>
                  )}
                  {item.category_name && (
                    <span className="absolute top-3 right-3 text-[11px] font-bold px-2 py-0.5 rounded bg-black/70 text-neutral-200 backdrop-blur-sm">
                      {item.category_name}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] text-neutral-400 block mb-1">
                      {new Date(item.published_at || item.created_at).toLocaleDateString('ar-LY')}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white mb-2 leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    {item.content && (
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {item.content}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-neutral-800">
                    <button
                      onClick={() => onNavigate('news', { slug: item.slug })}
                      className="text-xs font-semibold text-red-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {t('اقرأ المزيد', 'Read More')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. PRODUCTS CATALOG SPOTLIGHT */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
                {t('متجر ومكملات الجيم', 'Gym Supplements & Gear')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
                {t('منتجات معروضة بالصالة', 'In-Gym Products Catalog')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{t('عرض الكتالوج بالكامل', 'View Full Catalog')}</span>
              {isRtl ? <ChevronRight className="w-4 h-4 rotate-180" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <div
                key={product.id}
                className="group bg-[#0f0f13] border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div className="aspect-square bg-neutral-900 relative overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={resolveImageUrl(product.image_url, DEFAULT_IMAGES.products)}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                  )}
                  <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded bg-black/80 text-emerald-400 border border-emerald-900/30">
                    {product.availability_status || t('متوفر بالصالة', 'In Stock')}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] text-neutral-400 block mb-1">
                      {product.category_name}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-sm font-bold text-white tabular-nums">
                      {product.price > 0 ? `${product.price} ${product.currency}` : t('استفسر', 'Inquire')}
                    </span>
                    <button
                      onClick={() => onOpenInquiry(product)}
                      className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                    >
                      {t('استفسر', 'Inquire')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9. LOCATION & MAP BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#0f0f13] border border-neutral-800 rounded-2xl p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
                {t('الموقع الجغرافي', 'Location')}
              </span>
              <h2 className="text-3xl font-black font-heading text-white">
                OXYGEN GYM - طرابلس
              </h2>
              <div className="space-y-2 text-neutral-300 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="font-semibold text-white">
                    {settings?.address || 'طريق عين زارة، طرابلس، ليبيا'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Google Maps Plus Code:</span>
                  <span className="font-mono text-red-400 font-bold">
                    {settings?.plus_code || 'R84G+X2P'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed pt-2">
                {t(
                  'يسهل الوصول إلى النادي بموقع استراتيجي على طريق عين زارة الرئيسي مع مواقف سيارات واسعة ومريحة لجميع الزوار والمشتركين.',
                  'Easily accessible on the main Ain Zara Road in Tripoli with convenient parking for all members and visitors.'
                )}
              </p>

              <div className="pt-4 flex flex-wrap gap-3">
                <a
                  href={
                    settings?.google_maps_url ||
                    'https://www.google.com/maps/search/?api=1&query=R84G%2BX2P+Tripoli+Libya'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{t('فتح الموقع على Google Maps', 'Open in Google Maps')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => onNavigate('contact')}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer"
                >
                  {t('تواصل مع الاستقبال', 'Contact Front Desk')}
                </button>
              </div>
            </div>

            {/* Visual Location Frame */}
            <div className="rounded-xl overflow-hidden border border-neutral-700/80 bg-neutral-900 aspect-[16/10] relative flex items-center justify-center p-6 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500 text-red-500 mx-auto flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">طريق عين زارة، طرابلس</h4>
                <p className="text-xs font-mono text-red-400">R84G+X2P</p>
                <a
                  href={
                    settings?.google_maps_url ||
                    'https://www.google.com/maps/search/?api=1&query=R84G%2BX2P+Tripoli+Libya'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg border border-neutral-600 transition-colors"
                >
                  {t('عرض الخريطة التفاعلية في نافذة جديدة', 'View Interactive Map')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

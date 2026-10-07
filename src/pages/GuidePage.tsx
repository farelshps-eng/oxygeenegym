import React, { useState } from 'react';
import {
  Compass,
  Dumbbell,
  Flame,
  Users,
  CreditCard,
  Building2,
  Newspaper,
  ShoppingBag,
  MapPin,
  MessageSquare,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Smartphone,
  Calendar,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { FitnessCalculator } from '../components/FitnessCalculator';
import { GymLiveStatus } from '../components/GymLiveStatus';

interface GuidePageProps {
  onNavigate: (tab: string, extra?: { slug?: string }) => void;
  onOpenSubscribe: () => void;
  onOpenMemberAuth: (mode?: 'login' | 'register') => void;
}

export const GuidePage: React.FC<GuidePageProps> = ({
  onNavigate,
  onOpenSubscribe,
  onOpenMemberAuth,
}) => {
  const { lang, t } = useLanguage();
  const isRtl = lang === 'ar';

  const [activeTab, setActiveTab] = useState<string>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const guideSections = [
    {
      id: 'equipment',
      icon: Dumbbell,
      badge: 'الأجهزة والمعدات',
      title: 'استكشاف معدات وأجهزة النادي',
      desc: 'نوفر أحدث الأجهزة الرياضية والأوزان الحرة من كبرى الشركات العالمية.',
      actionText: 'تصفح المعدات الآن',
      targetTab: 'equipment',
      color: 'from-red-600 to-rose-600',
      steps: [
        'تصفح الأجهزة بحسب العضلة المستهدفة (صدر، ظهر، أرجل، أكتاف، ذراعين).',
        'اضغط على أي جهاز لمشاهدة تفاصيل الصانع، النموذج، والتعليمات الصحيحة لتفادي الإصابات.',
        'استكشف الأجهزة الموصى بها للمبتدئين والمحترفين.',
      ],
    },
    {
      id: 'training',
      icon: Flame,
      badge: 'البرامج الرياضية',
      title: 'التمارين وفنون القتال والملاكمة',
      desc: 'برامج تدريبية متكاملة لزيادة القوة، اللياقة البدنية، وتخفيف الوزن.',
      actionText: 'عرض التمارين والبرامج',
      targetTab: 'training',
      color: 'from-orange-600 to-red-600',
      steps: [
        'اطلع على فئات التدريب: كمال الأجسام، الملاكمة، الكارديو، والتدريب الوظيفي.',
        'تعرف على متطلبات ومستويات الصعوبة لكل برنامج.',
        'استكشف الصالات المخصصة لكل تدريب داخل النادي.',
      ],
    },
    {
      id: 'trainers',
      icon: Users,
      badge: 'الكادر التدريبي',
      title: 'المدربين المعتمدين والمشرفين',
      desc: 'فريق من نخبة المدربين أصحاب الخبرة بقيادة كابتن وليد وكابتن علي.',
      actionText: 'التعرف على المدربين',
      targetTab: 'trainers',
      color: 'from-amber-600 to-orange-600',
      steps: [
        'شاهد السيرة الذاتية وخبرة كل مدرب وتخصصه التدريبي.',
        'تعرف على مجالات التدريب التي يشرف عليها المدرب (تضخيم، تنشيف، تأهيل، ملاكمة).',
        'تواصل مع المدرب في الصالة للحصول على خطة تدريب وإشراف خاص.',
      ],
    },
    {
      id: 'memberships',
      icon: CreditCard,
      badge: 'الباقات والأسعار',
      title: 'باقات الاشتراك والالتحاق بالنادي',
      desc: 'باقات اشتراك مرنة شهرية وفصلية وسنوية بأفضل الأسعار وبخدمات شاملة.',
      actionText: 'استعراض الباقات والأسعار',
      targetTab: 'memberships',
      color: 'from-emerald-600 to-teal-600',
      steps: [
        'اختر الباقة المناسبة لأهدافك (الشهرية، الربع سنوية، النصف سنوية، أو السنوية).',
        'شاهد المميزات المشمولة بكل باقة (استخدام الأجهزة، غرف الساونا، الاستشارات التدريبية).',
        'تنويه هام: التسجيل وتفعيل الاشتراك يتم حضورياً داخل مقر النادي بطريق عين زارة.',
      ],
    },
    {
      id: 'portal',
      icon: Smartphone,
      badge: 'بوابة المشتركين',
      title: 'حساب المتدرب ومتابعة الاشتراك',
      desc: 'نظام رقمي ذكي لكل مشترك لمتابعة اشتراكه ومحادثة المدرب واستلام الجداول.',
      actionText: 'تسجيل دخول المتدرب',
      targetTab: 'portal_action',
      color: 'from-cyan-600 to-blue-600',
      steps: [
        'سجل دخولك برقم هاتفك المسجل لدى إدارة الجيم.',
        'تتبع صلاحية اشتراكك وعدد الأيام المتبقية وتنبيهات التجديد فوراً.',
        'ادخل إلى غرفة المحادثة المباشرة مع كابتن وليد لاستلام خطة التمرين وجدول التغذية المخصص لك.',
      ],
    },
    {
      id: 'facilities',
      icon: Building2,
      badge: 'المرافق والخدمات',
      title: 'مرافق الصالة والخدمات الإضافية',
      desc: 'مساحة تتجاوز 1500م² مجهزة بكافة المرافق الرياضية الفاخرة.',
      actionText: 'استكشاف المرافق',
      targetTab: 'facilities',
      color: 'from-purple-600 to-indigo-600',
      steps: [
        'صالة أجهزة ومقاومة مجهزة بأعلى المعايير العالمية.',
        'حلبة ملاكمة وأكياس احترافية لتمارين الفنون القتالية.',
        'غرف تبديل ملابس راقية، خزائن آمنة، واستراحات للاستشفاء.',
      ],
    },
    {
      id: 'products',
      icon: ShoppingBag,
      badge: 'المتجر والمكملات',
      title: 'المكملات الغذائية والإكسسوارات',
      desc: 'تشكيلة معتمدة من أفضل المكملات الغذائية العالمية والملابس الرياضية.',
      actionText: 'تصفح المنتجات والمكملات',
      targetTab: 'products',
      color: 'from-rose-600 to-pink-600',
      steps: [
        'استعرض بروتينات، كرياتين، وأحماض أمينية أصلية ومضمونة.',
        'اطلب استفساراً سريعاً عن أي منتج متوفر داخل صالة النادي.',
        'استشر المدرب قبل الشراء لمعرفة ما يناسب هدفك العضلي.',
      ],
    },
    {
      id: 'location',
      icon: MapPin,
      badge: 'الوصول والتواصل',
      title: 'الموقع وساعات العمل والاتصال',
      desc: 'موقع استراتيجي بطرابلس - طريق عين زارة مع مواقف واسعة وسهولة وصول.',
      actionText: 'عرض الخريطة وبيانات التواصل',
      targetTab: 'location',
      color: 'from-red-600 to-amber-600',
      steps: [
        'افتح رابط الموقع على خرائط Google Maps بالـ Plus Code أو الملاحة المباشرة.',
        'تحقق من شارة ساعات العمل الحية (مفتوح / مغلق) بتوقيت طرابلس.',
        'تواصل معنا مباشرة عبر WhatsApp أو الهاتف لأي استفسار.',
      ],
    },
  ];

  const faqs = [
    {
      qAr: 'كيف يمكنني التسجيل والاشتراك في أوكسجين جيم؟',
      qEn: 'How can I register and subscribe to Oxygen Gym?',
      aAr: 'التسجيل والاشتراك يتم حضورياً داخل مقر النادي بطريق عين زارة بطرابلس. يمكنك تصفح الباقات على الموقع واختيار ما يناسبك، ثم زيارة مكتب الاستقبال لإتمام التسجيل واستلام بطاقتك الرياضية.',
      aEn: 'Registration is completed in person at our gym location on Ain Zara Road in Tripoli. Choose your plan on the site, then visit reception to register and receive your membership card.',
    },
    {
      qAr: 'ما هي مواعيد وساعات عمل الجيم؟',
      qEn: 'What are the operating hours of Oxygen Gym?',
      aAr: 'نستقبلكم من السبت إلى الخميس من الساعة 08:00 صباحاً حتى 11:00 مساءً. ويوم الجمعة من الساعة 02:00 ظهراً حتى 10:00 مساءً.',
      aEn: 'We are open Saturday through Thursday from 8:00 AM to 11:00 PM, and on Fridays from 2:00 PM to 10:00 PM.',
    },
    {
      qAr: 'كيف أستخدم بوابة المشتركين وأتواصل مع كابتن وليد؟',
      qEn: 'How do I use the Member Portal and chat with Coach Waleed?',
      aAr: 'اضغط على زر «تسجيل الدخول» في أعلى الصفحة، وأدخل رقم هاتفك الذي سجلت به في الصالة مع كلمة المرور. ستفتح لك بطاقتك الرياضية، ومن تبويب «شات المدرب» يمكنك التحدث مباشرة مع كابتن وليد واستلام خطة التمرين والتغذية.',
      aEn: 'Click Login at the top, enter your registered phone and password. Access your digital membership card, and from the Coach Chat tab talk directly with Coach Waleed to receive training & diet plans.',
    },
    {
      qAr: 'هل يتوفر مدربين للإشراف على المبتدئين؟',
      qEn: 'Are there coaches available to supervise beginners?',
      aAr: 'نعم بالتأكيد! كادرنا التدريبي المعتمد متواجد في الصالة باستمرار لتعليم المبتدئين أسلوب التمرين الصحيح، ضبط الأوزان، ومنع الإصابات لضمان بداية رياضية قوية وآمنة.',
      aEn: 'Yes! Certified coaches are present on the gym floor to guide beginners, correct form, and ensure a safe and effective start.',
    },
    {
      qAr: 'هل أحتاج لحساب على الموقع لاستعراض الأجهزة والتمارين؟',
      qEn: 'Do I need an account to browse equipment and workouts?',
      aAr: 'لا، كامل الموقع متاح مجاناً للجميع بدون تسجيل! يمكنك تصفح الأجهزة، التمارين، المدربين، واستخدام حاسبة السعرات والكتلة بكل حرية وسهولة.',
      aEn: 'No! The site is completely open for everyone. You can browse all equipment, workouts, trainers, and use the fitness calculators freely.',
    },
    {
      qAr: 'هل تتوفر حصص ملاكمة وتدريبات لياقة خاصة؟',
      qEn: 'Are boxing and specialized fitness classes available?',
      aAr: 'نعم، يضم النادي حلبة ملاكمة مجهزة وأكياس تدريب متطورة بإشراف مدربين متخصصين، بالإضافة لبرامج الكارديو واللياقة البدنية الشاملة.',
      aEn: 'Yes, we have a fully equipped boxing ring and heavy bags supervised by certified fight coaches, alongside cardio and conditioning programs.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07070b] text-neutral-100 pb-20">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-neutral-800/80 bg-gradient-to-b from-[#0e0e16] via-[#07070b] to-[#07070b]">
        {/* Ambient Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('دليل الموقع الشامل للزائر والمشترك', 'Comprehensive Visitor & Member Guide')}</span>
            </div>
            <GymLiveStatus variant="compact" />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-white tracking-tight leading-tight">
            {t('دليلك الكامل لاستكشاف', 'Your Complete Guide to')} <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-red-500">
              {t('أوكسجين جيم والاستفادة من الموقع', 'Oxygen Gym & Digital Platform')}
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
            {t(
              'تعرف على كل ما يقدمه النادي وموقعه الإلكتروني خطوة بخطوة: من استكشاف الأجهزة والبرامج الرياضية، إلى متابعة عضويتك والتواصل المباشر مع المدرب واستلام الخطط التدريبية.',
              'Explore everything Oxygen Gym offers: discover equipment and workouts, meet trainers, calculate your fitness metrics, and access your member portal with coach chat.'
            )}
          </p>

          {/* Quick 3-Step Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto pt-6 text-start">
            <div className="p-4 rounded-2xl bg-[#101017] border border-neutral-800/90 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 font-black text-sm flex items-center justify-center shrink-0">
                1
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">استكشف النادي</span>
                <span className="text-neutral-400 text-[11px]">الأجهزة، البرامج، والمدربين</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#101017] border border-neutral-800/90 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600/20 text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                2
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">احسب احتياجك</span>
                <span className="text-neutral-400 text-[11px]">حاسبة السعرات والكتلة والهدف</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#101017] border border-neutral-800/90 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 font-black text-sm flex items-center justify-center shrink-0">
                3
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">زر الصالة واشترك</span>
                <span className="text-neutral-400 text-[11px]">طريق عين زارة - طرابلس</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE SECTIONS TOUR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
            {t('أقسام وخدمات الموقع', 'Site Features & Services')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-heading text-white">
            {t('كيف تستفيد من كل قسم في الموقع؟', 'How to Use Each Section?')}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            {t('اضغط على أي قسم لمعرفة مميزاته وكيفية استخدامه والانتقال إليه مباشرة', 'Click on any section to learn its features and navigate directly')}
          </p>
        </div>

        {/* Grid of Guide Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {guideSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                className="bg-[#0e0e15] border border-neutral-800/90 hover:border-red-600/40 rounded-3xl p-6 sm:p-7 space-y-5 transition-all shadow-xl hover:shadow-red-950/20 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${sec.color} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                          {sec.badge}
                        </span>
                        <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                          {sec.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
                    {sec.desc}
                  </p>

                  {/* Bullet points */}
                  <div className="space-y-2 pt-2 border-t border-neutral-800/60">
                    {sec.steps.map((st, sidx) => (
                      <div key={sidx} className="flex items-start gap-2 text-xs text-neutral-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (sec.targetTab === 'portal_action') {
                        onOpenMemberAuth('login');
                      } else {
                        onNavigate(sec.targetTab);
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-red-600 text-neutral-200 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:bg-red-600 group-hover:text-white"
                  >
                    <span>{sec.actionText}</span>
                    {isRtl ? <ArrowRight className="w-3.5 h-3.5 rotate-180" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. INTERACTIVE FITNESS CALCULATOR SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8 text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
            {t('أدوات اللياقة البدنية', 'Fitness Utilities')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
            {t('احسب سعراتك وكتلتك الآن مجاناً', 'Calculate Your Metrics Now')}
          </h2>
          <p className="text-xs text-neutral-400">
            {t('أداة تفاعلية سريعة تمكنك من معرفة هدفك والبدء بالتدريب والتغذية الصحيحة', 'Instant calculator to plan your macros and training approach')}
          </p>
        </div>

        <FitnessCalculator
          onNavigateToMemberships={() => {
            onNavigate('memberships');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateToTrainers={() => {
            onNavigate('trainers');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t('الأسئلة الشائعة للزوار', 'Visitor FAQs')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
            {t('كل ما قد ترغب في معرفته عن أوكسجين جيم', 'Everything You Might Want to Know')}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-neutral-800/80 bg-[#0e0e15] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-start gap-4 cursor-pointer hover:bg-neutral-900/60 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-white">
                    {lang === 'ar' ? faq.qAr : faq.qEn}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-red-500' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-3 animate-fadeIn">
                    {lang === 'ar' ? faq.aAr : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-red-950/60 via-[#12121a] to-red-950/60 border border-red-600/40 text-center space-y-5 relative overflow-hidden shadow-2xl">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نرحب بك في أي وقت بطل أوكسجين</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black font-heading text-white">
            جاهز للانطلاق وصناعة الفرق في لياقتك؟
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto">
            تفضل بزيارة صالتنا في طرابلس - طريق عين زارة لاختيار باقتك واستلام بطاقتك والبدء في برنامج تدريبي متكامل تحت إشراف نخبة المدربين.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenSubscribe}
              className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-xl shadow-red-950/60 cursor-pointer active:scale-95"
            >
              معلومات الاشتراك والتسجيل
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('location');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              موقع النادي على الخريطة
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

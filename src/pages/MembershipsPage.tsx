import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, MapPin, AlertCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Membership, SiteSettings } from '../types';
import { api } from '../services/api';

interface MembershipsPageProps {
  onOpenSubscribe: (planName?: string) => void;
  onNavigateToLocation: () => void;
  settings?: SiteSettings;
}

export const MembershipsPage: React.FC<MembershipsPageProps> = ({
  onOpenSubscribe,
  onNavigateToLocation,
  settings,
}) => {
  const { t } = useLanguage();
  const [plans, setPlans] = useState<Membership[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMemberships();
  }, []);

  const loadMemberships = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMemberships();
      setPlans(data);
    } catch (err) {
      setError(t('حدث خطأ أثناء تحميل باقات الاشتراك.', 'Failed to load memberships.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
          {t('الباقات والأسعار', 'Plans & Pricing')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
          {t('الاشتراكات في OXYGEN GYM', 'Oxygen Gym Memberships')}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          {t(
            'باقات اشتراك مرنة مصممة لتلائم جدولك وأهدافك البدنية. جميع الاشتراكات تسجل وتفعل حضوريًا داخل النادي.',
            'Flexible membership options tailored to your schedule. Subscriptions are registered in-person at the gym.'
          )}
        </p>
      </div>

      {/* Prominent Physical Subscription Notice Banner */}
      <div className="p-4 sm:p-5 bg-[#14141a] border border-red-900/40 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-start">
            <h4 className="text-sm font-bold text-white">
              {t('تنبيه: الاشتراك يتم داخل مقر الجيم فقط', 'Notice: Subscription is completed inside the gym only')}
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {t(
                'هذه الصفحة مخصصة لعرض الباقات والأسعار. لا يتوفر أي دفع أو خصم إلكتروني. للاشتراك يرجى زيارة مكتب الاستقبال بطريق عين زارة، طرابلس.',
                'This page displays plan specifications. There is NO online checkout. To subscribe, please visit our front desk in Tripoli.'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToLocation}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
        >
          <MapPin className="w-3.5 h-3.5 text-red-500" />
          <span>{t('عرض موقع الجيم', 'View Gym Location')}</span>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-neutral-500 space-y-2">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">{t('جاري تحميل الاشتراكات...', 'Loading membership plans...')}</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-16 p-6 bg-red-950/20 border border-red-900/40 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && plans.length === 0 && (
        <div className="text-center py-20 bg-[#0f0f13] border border-neutral-800 rounded-2xl p-8 space-y-3">
          <CreditCard className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {t('لا توجد باقات اشتراك مضافة حاليًا', 'No membership plans configured')}
          </h3>
          <p className="text-xs text-neutral-400">
            {t('يرجى التواصل مع إدارة الجيم للاستفسار عن الباقات المتوفرة.', 'Please contact front desk for current plans.')}
          </p>
        </div>
      )}

      {/* Plans Grid */}
      {!loading && !error && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
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
                    {t('الباقة الأكثر تميزاً', 'Featured Plan')}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold font-heading text-white">{plan.name}</h3>
                    <span className="text-xs text-red-400 font-semibold">{plan.duration}</span>
                  </div>

                  <div className="py-3 border-y border-neutral-800">
                    <span className="text-3xl sm:text-4xl font-black font-heading text-white tabular-nums">
                      {plan.price > 0 ? plan.price : t('حسب الطلب', 'Custom')}
                    </span>
                    <span className="text-xs text-neutral-400 mr-2 font-bold">{plan.currency}</span>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-neutral-400 leading-relaxed">{plan.description}</p>
                  )}

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

                {/* Mandatory In-Gym CTA */}
                <div className="mt-8 pt-4 border-t border-neutral-800 space-y-2">
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
                  <span className="block text-[11px] text-neutral-400 text-center">
                    {t('التسجيل حضوريًا بمكتب الاستقبال', 'Registration in person at front desk')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* HOW TO JOIN SECTION */}
      <div className="bg-[#0f0f13] border border-neutral-800 rounded-2xl p-8 sm:p-12">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
          <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
            {t('خطوات التسجيل', 'Registration Steps')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
            {t('كيف أشترك؟', 'How to Subscribe?')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 font-bold text-sm flex items-center justify-center border border-red-600/30">
              1
            </span>
            <h3 className="text-base font-bold text-white">
              {t('اختر الباقة المناسبة لك.', '1. Select Your Plan')}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {t(
                'حدد الخطة التي تناسب احتياجاتك التدريبية ووقتك من بين الباقات الأساسية أو الشاملة أو التدريب الخاص.',
                'Decide which membership tier or personal training package fits your routine.'
              )}
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 font-bold text-sm flex items-center justify-center border border-red-600/30">
              2
            </span>
            <h3 className="text-base font-bold text-white">
              {t('توجه إلى Oxygen Gym.', '2. Head to Oxygen Gym')}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {t(
                'تفضل بزيارتنا في مقر النادي بطريق عين زارة في طرابلس خلال ساعات الدوام الرسمية.',
                'Visit our facility on Ain Zara Road, Tripoli during our regular operating hours.'
              )}
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 font-bold text-sm flex items-center justify-center border border-red-600/30">
              3
            </span>
            <h3 className="text-base font-bold text-white">
              {t('قم بالاشتراك من داخل الجيم.', '3. Subscribe In Person')}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {t(
                'أتمم إجراءات التسجيل لدى موظف الاستقبال، استلم بطاقتك التعريفية، وابدأ أول تمرين.',
                'Complete your membership form at the front desk, receive your keycard, and commence training.'
              )}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onNavigateToLocation}
            className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            <span>{t('اعرف موقعنا', 'Find Our Location')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

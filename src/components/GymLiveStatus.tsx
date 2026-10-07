import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Moon, Calendar, X, ChevronDown, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface GymStatusInfo {
  isOpen: boolean;
  statusTextAr: string;
  statusTextEn: string;
  closingOrOpeningTextAr: string;
  closingOrOpeningTextEn: string;
}

export function getGymCurrentStatus(): GymStatusInfo {
  // Tripoli is UTC+2
  const now = new Date();
  // Calculate Tripoli local time
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const tripoliOffset = 2 * 60; // UTC+2
  const tripoliDate = new Date(utc + tripoliOffset * 60000);

  const day = tripoliDate.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
  const hours = tripoliDate.getHours();
  const minutes = tripoliDate.getMinutes();
  const currentDecTime = hours + minutes / 60;

  let isOpen = false;
  let statusTextAr = '';
  let statusTextEn = '';
  let closingOrOpeningTextAr = '';
  let closingOrOpeningTextEn = '';

  if (day === 5) {
    // Friday: 14:00 (2 PM) to 22:00 (10 PM)
    if (currentDecTime >= 14 && currentDecTime < 22) {
      isOpen = true;
      statusTextAr = 'مفتوح الآن';
      statusTextEn = 'Open Now';
      closingOrOpeningTextAr = 'يغلق الساعة 10:00 مساءً';
      closingOrOpeningTextEn = 'Closes at 10:00 PM';
    } else {
      isOpen = false;
      statusTextAr = 'مغلق حالياً';
      statusTextEn = 'Closed Now';
      if (currentDecTime < 14) {
        closingOrOpeningTextAr = 'يفتح اليوم الجمعة الساعة 2:00 ظهراً';
        closingOrOpeningTextEn = 'Opens today (Friday) at 2:00 PM';
      } else {
        closingOrOpeningTextAr = 'يفتح غداً السبت الساعة 8:00 صباحاً';
        closingOrOpeningTextEn = 'Opens tomorrow at 8:00 AM';
      }
    }
  } else {
    // Saturday to Thursday: 08:00 AM to 23:00 (11 PM)
    if (currentDecTime >= 8 && currentDecTime < 23) {
      isOpen = true;
      statusTextAr = 'مفتوح الآن';
      statusTextEn = 'Open Now';
      closingOrOpeningTextAr = 'يغلق الساعة 11:00 مساءً';
      closingOrOpeningTextEn = 'Closes at 11:00 PM';
    } else {
      isOpen = false;
      statusTextAr = 'مغلق حالياً';
      statusTextEn = 'Closed Now';
      if (currentDecTime < 8) {
        closingOrOpeningTextAr = 'يفتح اليوم الساعة 8:00 صباحاً';
        closingOrOpeningTextEn = 'Opens today at 8:00 AM';
      } else {
        const nextOpensFriday = day === 4; // Thursday night
        closingOrOpeningTextAr = nextOpensFriday
          ? 'يفتح غداً الجمعة الساعة 2:00 ظهراً'
          : 'يفتح غداً الساعة 8:00 صباحاً';
        closingOrOpeningTextEn = nextOpensFriday
          ? 'Opens tomorrow (Friday) at 2:00 PM'
          : 'Opens tomorrow at 8:00 AM';
      }
    }
  }

  return {
    isOpen,
    statusTextAr,
    statusTextEn,
    closingOrOpeningTextAr,
    closingOrOpeningTextEn,
  };
}

export const GymLiveStatus: React.FC<{ variant?: 'badge' | 'card' | 'compact' }> = ({
  variant = 'badge',
}) => {
  const { lang, t } = useLanguage();
  const [status, setStatus] = useState<GymStatusInfo>(getGymCurrentStatus);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getGymCurrentStatus());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const schedule = [
    { daysAr: 'السبت – الخميس', daysEn: 'Saturday – Thursday', hours: '08:00 ص – 11:00 م', hoursEn: '08:00 AM – 11:00 PM', active: new Date().getDay() !== 5 },
    { daysAr: 'الجمعة', daysEn: 'Friday', hours: '02:00 م – 10:00 م', hoursEn: '02:00 PM – 10:00 PM', active: new Date().getDay() === 5 },
  ];

  if (variant === 'compact') {
    return (
      <button
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 text-xs transition-all cursor-pointer group"
        title="انقر لمشاهدة جدول ساعات العمل"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
          }`}
        />
        <span className="font-bold text-white group-hover:text-red-400 transition-colors">
          {lang === 'ar' ? status.statusTextAr : status.statusTextEn}
        </span>
        <span className="text-neutral-400 text-[11px] hidden sm:inline">
          ({lang === 'ar' ? status.closingOrOpeningTextAr : status.closingOrOpeningTextEn})
        </span>
        <ChevronDown className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300" />
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111118]/90 border border-neutral-800/90 hover:border-red-600/50 text-xs transition-all cursor-pointer shadow-lg shadow-black/40 group active:scale-95"
      >
        <div className="relative flex items-center justify-center">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              status.isOpen ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          {status.isOpen && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute animate-ping opacity-75" />
          )}
        </div>
        <span className="font-black text-white text-xs tracking-wide">
          {lang === 'ar' ? status.statusTextAr : status.statusTextEn}
        </span>
        <span className="text-neutral-400 text-[11px] border-r border-neutral-700/60 pr-2 mr-1">
          {lang === 'ar' ? status.closingOrOpeningTextAr : status.closingOrOpeningTextEn}
        </span>
        <Clock className="w-3.5 h-3.5 text-neutral-400 group-hover:text-red-400 transition-colors" />
      </button>

      {/* Schedule Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#101017] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl relative text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 left-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  status.isOpen
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{t('مواعيد عمل أوكسجين جيم', 'Oxygen Gym Working Hours')}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      status.isOpen
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {lang === 'ar' ? status.statusTextAr : status.statusTextEn}
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  {lang === 'ar' ? status.closingOrOpeningTextAr : status.closingOrOpeningTextEn}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-800/80">
              {schedule.map((s, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    s.active
                      ? 'bg-red-950/20 border-red-600/40 text-white font-bold'
                      : 'bg-[#14141e] border-neutral-800/80 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{lang === 'ar' ? s.daysAr : s.daysEn}</span>
                    {s.active && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-600/30 text-red-300 border border-red-500/30">
                        {t('اليوم', 'Today')}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-neutral-200">
                    {lang === 'ar' ? s.hours : s.hoursEn}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800/80 text-[11px] text-neutral-400 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>
                {t(
                  'الموقع: طرابلس، طريق عين زارة. نستقبل المشتركين يومياً طيلة أوقات الدوام.',
                  'Location: Tripoli, Ain Zara Road. Members and visitors are welcomed daily.'
                )}
              </span>
            </div>

            <button
              onClick={() => setModalOpen(false)}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {t('إغلاق', 'Close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

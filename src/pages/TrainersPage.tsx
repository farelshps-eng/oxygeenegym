import React, { useState, useEffect } from 'react';
import { Users, X, Award, CheckCircle2, ChevronRight, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Trainer, SiteSettings } from '../types';
import { api } from '../services/api';
import { DEFAULT_IMAGES, resolveImageUrl } from '../lib/media';

interface TrainersPageProps {
  initialSlug?: string;
  onClearInitialSlug?: () => void;
  onOpenSubscribe?: () => void;
  settings?: SiteSettings;
}

export const TrainersPage: React.FC<TrainersPageProps> = ({
  initialSlug,
  onClearInitialSlug,
  onOpenSubscribe,
  settings,
}) => {
  const { t, isRtl } = useLanguage();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTrainers();
      setTrainers(data);
      if (initialSlug) {
        const match = data.find((tr) => tr.slug === initialSlug);
        if (match) setSelectedTrainer(match);
      }
    } catch (err) {
      setError(t('حدث خطأ أثناء تحميل بيانات المدربين.', 'Failed to load trainers.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedTrainer(null);
    if (onClearInitialSlug) onClearInitialSlug();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
          {t('الكادر التدريبي', 'Coaching Staff')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
          {t('المدربين المعتمدين', 'Certified Trainers')}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          {t(
            'نخبة من المدربين المحترفين في بناء الأجسام، اللياقة البدنية، والفنون القتالية لإرشادك خلال رحلتك الرياضية.',
            'Meet our certified trainers and fight coaches dedicated to elevating your performance and fitness.'
          )}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-neutral-500 space-y-2">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">{t('جاري تحميل المدربين...', 'Loading coaches...')}</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-16 p-6 bg-red-950/20 border border-red-900/40 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && trainers.length === 0 && (
        <div className="text-center py-20 bg-[#0f0f13] border border-neutral-800 rounded-2xl p-8 space-y-3">
          <Users className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {t('لا يوجد مدربون مضافون حاليًا', 'No trainers listed yet')}
          </h3>
          <p className="text-xs text-neutral-400">
            {t('يمكن لإدارة الجيم إضافة بيانات المدربين عبر لوحة التحكم.', 'Coaches will be added by gym management.')}
          </p>
        </div>
      )}

      {/* Trainers Grid */}
      {!loading && !error && trainers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer) => {
            let trainingTypes: string[] = [];
            try {
              trainingTypes = trainer.training_types_json ? JSON.parse(trainer.training_types_json) : [];
            } catch (e) {
              trainingTypes = [];
            }

            return (
              <div
                key={trainer.id}
                className="group bg-[#0f0f13] border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-all"
              >
                <div className="aspect-[4/3] bg-neutral-900 relative overflow-hidden">
                  {trainer.photo_url ? (
                    <img
                      src={resolveImageUrl(trainer.photo_url, DEFAULT_IMAGES.trainers)}
                      alt={trainer.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                      <Users className="w-16 h-16" />
                    </div>
                  )}
                  {trainer.specialty && (
                    <span className="absolute bottom-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded bg-black/80 text-red-400 border border-red-900/40 backdrop-blur-sm">
                      {trainer.specialty}
                    </span>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors mb-1">
                      {trainer.name}
                    </h3>
                    {trainer.experience && (
                      <span className="text-xs text-neutral-500 font-medium block mb-2">
                        {trainer.experience}
                      </span>
                    )}
                    {trainer.bio && (
                      <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                        {trainer.bio}
                      </p>
                    )}

                    {trainingTypes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {trainingTypes.slice(0, 3).map((type, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-end">
                    <button
                      onClick={() => setSelectedTrainer(trainer)}
                      className="text-xs font-bold text-red-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>{t('عرض الملف الشخصي', 'View Profile')}</span>
                      {isRtl ? <ChevronRight className="w-3.5 h-3.5 rotate-180" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trainer Profile Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#111115] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <button
              onClick={handleCloseDetail}
              className="absolute top-4 right-4 z-10 p-2 text-neutral-400 hover:text-white rounded-lg bg-black/50 hover:bg-black/80 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-[16/10] w-full bg-neutral-900 relative shrink-0">
              {selectedTrainer.photo_url ? (
                <img
                  src={resolveImageUrl(selectedTrainer.photo_url, DEFAULT_IMAGES.trainers)}
                  alt={selectedTrainer.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600">
                  <Users className="w-16 h-16" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-2xl font-bold font-heading text-white">{selectedTrainer.name}</h3>
                  <p className="text-xs text-red-400 font-semibold">{selectedTrainer.specialty}</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-5 flex-1">
              {selectedTrainer.experience && (
                <div className="flex items-center gap-2 text-xs text-neutral-300 bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                  <Award className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="font-semibold text-white">{t('سنوات الخبرة والاعتماد: ', 'Experience: ')}</span>
                  <span>{selectedTrainer.experience}</span>
                </div>
              )}

              {selectedTrainer.bio && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    {t('نبذة عن المدرب', 'Biography')}
                  </h4>
                  <p className="text-sm text-neutral-300 leading-relaxed">{selectedTrainer.bio}</p>
                </div>
              )}

              {selectedTrainer.training_types_json && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    {t('الرياضات والتدريبات التابعة', 'Specialized Disciplines')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(selectedTrainer.training_types_json || '[]').map((type: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-200"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* In-Gym training notice */}
              <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs text-neutral-400 leading-relaxed">
                <span className="text-white font-semibold block mb-1">
                  {t('حجز جلسات التدريب الخاص (Personal Training)', 'Personal Training Booking')}
                </span>
                <p>
                  {t(
                    'لحجز حصص تدريب فردية أو التنسيق مع المدرب، يرجى التوجه إلى مكتب الاستقبال في النادي بطريق عين زارة أو الاستفسار هاتفياً.',
                    'To book 1-on-1 personal training sessions with the coach, please visit front desk in person.'
                  )}
                </p>
              </div>

              <div className="pt-2 flex justify-between items-center">
                {onOpenSubscribe && (
                  <button
                    onClick={() => {
                      handleCloseDetail();
                      onOpenSubscribe();
                    }}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {t('الاشتراك في الجيم', 'Join The Gym')}
                  </button>
                )}
                <button
                  onClick={handleCloseDetail}
                  className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {t('إغلاق', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

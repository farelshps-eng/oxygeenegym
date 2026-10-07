import React, { useState, useEffect } from 'react';
import { Flame, X, ChevronRight, Users, Shield, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Training, Category } from '../types';
import { api } from '../services/api';
import { DEFAULT_IMAGES, resolveImageUrl } from '../lib/media';

interface TrainingPageProps {
  initialSlug?: string;
  onNavigateToTrainers: () => void;
  onClearInitialSlug?: () => void;
}

export const TrainingPage: React.FC<TrainingPageProps> = ({
  initialSlug,
  onNavigateToTrainers,
  onClearInitialSlug,
}) => {
  const { t, isRtl } = useLanguage();
  const [trainingList, setTrainingList] = useState<Training[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<Training | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trnData, catData] = await Promise.all([
        api.getTraining(selectedCategory === 'all' ? undefined : selectedCategory),
        api.getTrainingCategories(),
      ]);
      setTrainingList(trnData);
      setCategories(catData);

      if (initialSlug) {
        const match = trnData.find((item) => item.slug === initialSlug);
        if (match) setSelectedItem(match);
      }
    } catch (err) {
      setError(t('حدث خطأ أثناء تحميل التمارين. حاول مرة أخرى.', 'Error loading training programs.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
    if (onClearInitialSlug) onClearInitialSlug();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
          {t('البرامج التدريبية', 'Training Disciplines')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
          {t('التمارين والرياضات', 'Training & Sports')}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          {t(
            'من الفنون القتالية والملاكمة إلى رفع الأثقال وتدريبات اللياقة المكثفة، اكتشف التمارين المتوفرة داخل أوكسجين جيم.',
            'From combat sports and boxing to Olympic lifting and functional endurance, discover what drives Oxygen Gym.'
          )}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-red-600 text-white'
              : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800'
          }`}
        >
          {t('جميع التمارين', 'All Programs')}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat.name
                ? 'bg-red-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20 text-neutral-500 space-y-2">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">{t('جاري تحميل التمارين...', 'Loading training...')}</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-16 p-6 bg-red-950/20 border border-red-900/40 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && trainingList.length === 0 && (
        <div className="text-center py-20 bg-[#0f0f13] border border-neutral-800 rounded-2xl p-8 space-y-3">
          <Flame className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {t('لا توجد تمارين مضافة حاليًا', 'No training programs found')}
          </h3>
          <p className="text-xs text-neutral-400">
            {t('يرجى اختيار تصنيف آخر أو العودة لاحقًا.', 'Please select another category.')}
          </p>
        </div>
      )}

      {/* Training Cards Grid */}
      {!loading && !error && trainingList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainingList.map((item) => (
            <div
              key={item.id}
              className="group bg-[#0f0f13] border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-all"
            >
              <div className="aspect-[16/10] bg-neutral-900 relative overflow-hidden">
                {item.image_url ? (
                  <img
                    src={resolveImageUrl(item.image_url, DEFAULT_IMAGES.training)}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    <Flame className="w-12 h-12" />
                  </div>
                )}
                {item.category_name && (
                  <span className="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-0.5 rounded bg-black/80 text-red-400 border border-red-900/40 backdrop-blur-sm">
                    {item.category_name}
                  </span>
                )}
                {item.difficulty && (
                  <span className="absolute bottom-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded bg-black/80 text-neutral-300">
                    {item.difficulty}
                  </span>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors mb-2">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    {item.difficulty || t('جميع المستويات', 'All levels')}
                  </span>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{t('اكتشف التمرين', 'Explore')}</span>
                    {isRtl ? <ChevronRight className="w-3.5 h-3.5 rotate-180" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Training Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#111115] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <button
              onClick={handleCloseDetail}
              className="absolute top-4 right-4 z-10 p-2 text-neutral-400 hover:text-white rounded-lg bg-black/50 hover:bg-black/80 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-[16/9] w-full bg-neutral-900 relative shrink-0">
              {selectedItem.image_url ? (
                <img
                  src={resolveImageUrl(selectedItem.image_url, DEFAULT_IMAGES.training)}
                  alt={selectedItem.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600">
                  <Flame className="w-16 h-16" />
                </div>
              )}
              {selectedItem.category_name && (
                <span className="absolute bottom-4 right-4 text-xs font-bold px-3 py-1 rounded-lg bg-black/80 text-red-400 border border-red-900/40">
                  {selectedItem.category_name}
                </span>
              )}
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mb-2">
                  {selectedItem.name}
                </h3>
                {selectedItem.difficulty && (
                  <span className="inline-block text-xs px-2.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-semibold mb-3">
                    {t('مستوى الصعوبة: ', 'Difficulty: ')}
                    {selectedItem.difficulty}
                  </span>
                )}
                {selectedItem.description && (
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {selectedItem.description}
                  </p>
                )}
              </div>

              {/* Training features highlight */}
              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                <span className="text-xs font-bold text-white block">
                  {t('مميزات التدريب في أوكسجين جيم', 'Training at Oxygen Gym')}
                </span>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {t(
                    'يتم تقديم التدريبات بإشراف مباشر من مدربين معتمدين داخل صالات مخصصة ومجهزة بأحدث وسائل الأمان والحماية الرياضية.',
                    'Conducted directly by certified trainers in dedicated spaces with safety equipment.'
                  )}
                </p>
              </div>

              {/* Action: View Trainers */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <button
                  onClick={() => {
                    handleCloseDetail();
                    onNavigateToTrainers();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>{t('تعرف على المدربين', 'Meet Our Trainers')}</span>
                </button>

                <button
                  onClick={handleCloseDetail}
                  className="w-full sm:w-auto px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
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

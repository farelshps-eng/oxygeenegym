import React, { useState, useEffect } from 'react';
import { Search, Dumbbell, X, ChevronRight, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Equipment, Category } from '../types';
import { api } from '../services/api';
import { DEFAULT_IMAGES, resolveImageUrl } from '../lib/media';

interface EquipmentPageProps {
  initialSlug?: string;
  onClearInitialSlug?: () => void;
}

export const EquipmentPage: React.FC<EquipmentPageProps> = ({
  initialSlug,
  onClearInitialSlug,
}) => {
  const { t, isRtl } = useLanguage();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [eqData, catData] = await Promise.all([
        api.getEquipment({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          search: searchQuery || undefined,
        }),
        api.getEquipmentCategories(),
      ]);
      setEquipmentList(eqData);
      setCategories(catData);

      if (initialSlug) {
        const match = eqData.find((e) => e.slug === initialSlug);
        if (match) setSelectedItem(match);
      }
    } catch (err: any) {
      setError(t('حدث خطأ أثناء تحميل المعدات. حاول مرة أخرى.', 'Error loading equipment. Please try again.'));
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
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
          {t('التجهيزات والمعدات', 'Gym Machinery')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
          {t('معدات OXYGEN GYM', 'Oxygen Gym Equipment')}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          {t(
            'تعرف على الأجهزة الرياضية والأوزان الحرة المتوفرة داخل النادي لتدريب دقيق وآمن على أعلى مستوى.',
            'Explore the professional gym equipment, isolation machines, and free weights inside our club.'
          )}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('ابحث عن معدة، عضلة مستهدفة، أو جهاز...', 'Search machine or muscle group...')}
              className="w-full bg-[#111115] border border-neutral-800 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800'
            }`}
          >
            {t('جميع المعدات', 'All Equipment')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20 text-neutral-500 space-y-2">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">{t('جاري تحميل المعدات...', 'Loading equipment...')}</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-16 p-6 bg-red-950/20 border border-red-900/40 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && equipmentList.length === 0 && (
        <div className="text-center py-20 bg-[#0f0f13] border border-neutral-800 rounded-2xl p-8 space-y-3">
          <Dumbbell className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {t('لا توجد معدات مضافة حاليًا', 'No equipment found')}
          </h3>
          <p className="text-xs text-neutral-400">
            {t('جرب تغيير معايير البحث أو اختيار تصنيف آخر.', 'Try changing your search keywords or category.')}
          </p>
        </div>
      )}

      {/* Equipment Cards Grid */}
      {!loading && !error && equipmentList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipmentList.map((item) => (
            <div
              key={item.id}
              className="group bg-[#0f0f13] border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-all"
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
                  <span className="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-0.5 rounded bg-black/80 text-neutral-200 border border-neutral-700/60 backdrop-blur-sm">
                    {item.category_name}
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {item.target_muscles && (
                    <p className="text-[11px] text-neutral-400">
                      <span className="text-neutral-500">{t('العضلات المستهدفة: ', 'Target: ')}</span>
                      {item.target_muscles}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-mono">
                    {item.manufacturer || 'Oxygen'}
                  </span>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="text-xs font-bold text-red-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{t('عرض التفاصيل', 'View Details')}</span>
                    {isRtl ? <ChevronRight className="w-3.5 h-3.5 rotate-180" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Equipment Detail Modal */}
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

            {/* Modal Image */}
            <div className="aspect-[16/9] w-full bg-neutral-900 relative shrink-0">
              {selectedItem.image_url ? (
                <img
                  src={resolveImageUrl(selectedItem.image_url, DEFAULT_IMAGES.equipment)}
                  alt={selectedItem.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600">
                  <Dumbbell className="w-16 h-16" />
                </div>
              )}
              {selectedItem.category_name && (
                <span className="absolute bottom-4 right-4 text-xs font-bold px-3 py-1 rounded-lg bg-black/80 text-red-400 border border-red-900/40">
                  {selectedItem.category_name}
                </span>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-5 flex-1">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mb-2">
                  {selectedItem.name}
                </h3>
                {selectedItem.description && (
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {selectedItem.description}
                  </p>
                )}
              </div>

              {/* Attributes (Hide fields with no data) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {selectedItem.manufacturer && (
                  <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                    <span className="block text-[11px] text-neutral-500 uppercase">
                      {t('الشركة المصنعة', 'Manufacturer')}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {selectedItem.manufacturer}
                    </span>
                  </div>
                )}
                {selectedItem.model && (
                  <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                    <span className="block text-[11px] text-neutral-500 uppercase">
                      {t('الموديل', 'Model')}
                    </span>
                    <span className="text-sm font-semibold text-white font-mono">
                      {selectedItem.model}
                    </span>
                  </div>
                )}
                {selectedItem.target_muscles && (
                  <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 sm:col-span-2">
                    <span className="block text-[11px] text-neutral-500 uppercase">
                      {t('العضلات المستهدفة', 'Target Muscles')}
                    </span>
                    <span className="text-sm font-semibold text-red-400">
                      {selectedItem.target_muscles}
                    </span>
                  </div>
                )}
                {selectedItem.usage_level && (
                  <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                    <span className="block text-[11px] text-neutral-500 uppercase">
                      {t('مستوى الاستخدام', 'Difficulty / Level')}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {selectedItem.usage_level}
                    </span>
                  </div>
                )}
              </div>

              {selectedItem.instructions && (
                <div className="p-4 bg-neutral-900/60 rounded-lg border border-neutral-800 space-y-1">
                  <span className="block text-xs font-bold text-white">
                    {t('تعليمات الاستخدام والأداء الصحيح', 'Usage Instructions')}
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {selectedItem.instructions}
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleCloseDetail}
                  className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
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

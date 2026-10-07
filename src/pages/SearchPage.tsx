import React, { useState, useEffect } from 'react';
import { Search, X, Dumbbell, Flame, Users, CreditCard, Building, Calendar, ShoppingBag, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface SearchPageProps {
  onNavigate: (tab: string, extra?: any) => void;
  onOpenSubscribe: (planName?: string) => void;
  onOpenInquiry: (product: any) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  onNavigate,
  onOpenSubscribe,
  onOpenInquiry,
}) => {
  const { t, isRtl } = useLanguage();
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [results, setResults] = useState<{
    equipment?: any[];
    training?: any[];
    trainers?: any[];
    memberships?: any[];
    facilities?: any[];
    news?: any[];
    products?: any[];
  }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query, activeType);
      } else {
        setResults({});
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, activeType]);

  const performSearch = async (q: string, type: string) => {
    setLoading(true);
    try {
      const data = await api.searchGlobal(q, type);
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalResults =
    (results.equipment?.length || 0) +
    (results.training?.length || 0) +
    (results.trainers?.length || 0) +
    (results.memberships?.length || 0) +
    (results.facilities?.length || 0) +
    (results.news?.length || 0) +
    (results.products?.length || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
          {t('البحث والاستكشاف العام', 'Global Discovery')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
          {t('تصفح OXYGEN GYM', 'Explore Oxygen Gym')}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          {t(
            'ابحث في كامل محتوى النادي: المعدات، التدريبات، المدربين، باقات الاشتراك، المرافق، الأخبار، والمنتجات.',
            'Search across equipment, training programs, trainers, memberships, facilities, news, and catalog.'
          )}
        </p>
      </div>

      {/* Main Search Input */}
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-neutral-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('ماذا تبحث عنه؟ (مثال: ملاكمة، صدر، بروتين، اشتراك...)', 'What are you looking for? (e.g. boxing, chest, protein, basic...)')}
            className="w-full bg-[#111115] border-2 border-neutral-800 rounded-2xl pr-12 pl-10 py-4 text-sm sm:text-base text-white focus:outline-none focus:border-red-600 transition-colors shadow-2xl"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Type Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-center">
          {[
            { id: 'all', ar: 'الكل', en: 'All' },
            { id: 'equipment', ar: 'المعدات', en: 'Equipment' },
            { id: 'training', ar: 'التمارين', en: 'Training' },
            { id: 'trainers', ar: 'المدربين', en: 'Trainers' },
            { id: 'memberships', ar: 'الاشتراكات', en: 'Memberships' },
            { id: 'facilities', ar: 'المرافق', en: 'Facilities' },
            { id: 'news', ar: 'الأخبار', en: 'News' },
            { id: 'products', ar: 'المنتجات', en: 'Products' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeType === tab.id
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800'
              }`}
            >
              {t(tab.ar, tab.en)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-neutral-500">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">{t('جاري البحث...', 'Searching database...')}</p>
        </div>
      )}

      {/* Empty Query prompt */}
      {!query && !loading && (
        <div className="text-center py-20 bg-[#0f0f13] border border-neutral-800 rounded-2xl p-8 max-w-xl mx-auto space-y-2">
          <Search className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">
            {t('أدخل كلمة البحث في الحقل أعلاه', 'Type a keyword above to start searching')}
          </h3>
          <p className="text-xs text-neutral-400">
            {t('يمكنك البحث عن أي معدة أو رياضة أو مكمل أو اسم مدرب.', 'Discover any gym facility, exercise, trainer, or item.')}
          </p>
        </div>
      )}

      {/* Query with No Results */}
      {query && !loading && totalResults === 0 && (
        <div className="text-center py-20 bg-[#0f0f13] border border-neutral-800 rounded-2xl p-8 max-w-xl mx-auto space-y-2">
          <p className="text-sm font-bold text-white">
            {t(`لم يتم العثور على نتائج تطابق: "${query}"`, `No results found matching: "${query}"`)}
          </p>
          <p className="text-xs text-neutral-400">
            {t('تأكد من كتابة الكلمة بشكل صحيح أو جرب كلمات أخرى.', 'Try checking for typos or use more general terms.')}
          </p>
        </div>
      )}

      {/* Results Groups */}
      {query && !loading && totalResults > 0 && (
        <div className="space-y-10 max-w-5xl mx-auto">
          {/* Equipment Results */}
          {results.equipment && results.equipment.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
                <Dumbbell className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">
                  {t('المعدات والأجهزة', 'Equipment')} ({results.equipment.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.equipment.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate('equipment', { slug: item.slug })}
                    className="p-4 rounded-xl bg-[#0f0f13] border border-neutral-800 hover:border-red-600/50 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <span className="text-[10px] text-red-400 font-bold block">{item.category_name}</span>
                      <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">{item.name}</h4>
                    </div>
                    {isRtl ? <ChevronRight className="w-4 h-4 text-neutral-500 rotate-180" /> : <ChevronRight className="w-4 h-4 text-neutral-500" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Training Results */}
          {results.training && results.training.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
                <Flame className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">
                  {t('التمارين والرياضات', 'Training & Sports')} ({results.training.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.training.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate('training', { slug: item.slug })}
                    className="p-4 rounded-xl bg-[#0f0f13] border border-neutral-800 hover:border-red-600/50 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <span className="text-[10px] text-red-400 font-bold block">{item.category_name}</span>
                      <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">{item.name}</h4>
                    </div>
                    {isRtl ? <ChevronRight className="w-4 h-4 text-neutral-500 rotate-180" /> : <ChevronRight className="w-4 h-4 text-neutral-500" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trainers Results */}
          {results.trainers && results.trainers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
                <Users className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">
                  {t('المدربين', 'Trainers')} ({results.trainers.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.trainers.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate('trainers', { slug: item.slug })}
                    className="p-4 rounded-xl bg-[#0f0f13] border border-neutral-800 hover:border-red-600/50 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">{item.name}</h4>
                      <span className="text-xs text-neutral-400">{item.specialty}</span>
                    </div>
                    {isRtl ? <ChevronRight className="w-4 h-4 text-neutral-500 rotate-180" /> : <ChevronRight className="w-4 h-4 text-neutral-500" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Memberships Results */}
          {results.memberships && results.memberships.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
                <CreditCard className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">
                  {t('باقات الاشتراك', 'Memberships')} ({results.memberships.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.memberships.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onOpenSubscribe(item.name)}
                    className="p-4 rounded-xl bg-[#0f0f13] border border-neutral-800 hover:border-red-600/50 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">{item.name}</h4>
                      <span className="text-xs text-red-400 font-semibold">{item.duration} · {item.price} {item.currency}</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded bg-neutral-800 text-neutral-200">
                      {t('الاشتراك داخل الجيم', 'In-Gym')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Results */}
          {results.products && results.products.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
                <ShoppingBag className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">
                  {t('المنتجات والمكملات', 'Products')} ({results.products.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.products.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onOpenInquiry(item)}
                    className="p-4 rounded-xl bg-[#0f0f13] border border-neutral-800 hover:border-red-600/50 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">{item.name}</h4>
                      <span className="text-xs text-neutral-400 tabular-nums">{item.price} {item.currency}</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded bg-red-600/20 text-red-400 font-semibold">
                      {t('استفسر', 'Inquire')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

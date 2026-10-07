import React, { useState, useEffect } from 'react';
import { Calendar, User, X, ChevronRight, Share2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { NewsItem, Category } from '../types';
import { api } from '../services/api';
import { DEFAULT_IMAGES, resolveImageUrl } from '../lib/media';

interface NewsPageProps {
  initialSlug?: string;
  onClearInitialSlug?: () => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({
  initialSlug,
  onClearInitialSlug,
}) => {
  const { t, isRtl } = useLanguage();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNews();
  }, [selectedCategory]);

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const [nData, catData] = await Promise.all([
        api.getNews({ category: selectedCategory === 'all' ? undefined : selectedCategory }),
        api.getNewsCategories(),
      ]);
      setNewsList(nData);
      setCategories(catData);

      if (initialSlug) {
        const match = nData.find((n) => n.slug === initialSlug);
        if (match) setSelectedArticle(match);
      }
    } catch (err) {
      setError(t('حدث خطأ أثناء تحميل الأخبار.', 'Failed to load news.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
    if (onClearInitialSlug) onClearInitialSlug();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
          {t('المركز الإعلامي', 'Media & News')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
          {t('أخبار OXYGEN GYM', 'Oxygen Gym News')}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          {t(
            'تابع بطولاتنا، إعلاناتنا، الفعاليات التدريبية، وأحدث المستجدات داخل الصالة الرياضية.',
            'Keep up with tournaments, upcoming gym events, operational announcements, and fitness tips.'
          )}
        </p>
      </div>

      {/* Category selector */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-red-600 text-white'
              : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800'
          }`}
        >
          {t('جميع الأخبار', 'All News')}
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

      {loading && (
        <div className="text-center py-20 text-neutral-500 space-y-2">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">{t('جاري تحميل الأخبار...', 'Loading articles...')}</p>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-16 p-6 bg-red-950/20 border border-red-900/40 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && newsList.length === 0 && (
        <div className="text-center py-20 bg-[#0f0f13] border border-neutral-800 rounded-2xl p-8 space-y-3">
          <Calendar className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {t('لا توجد أخبار منشورة حاليًا في هذا القسم', 'No news published in this category')}
          </h3>
          <p className="text-xs text-neutral-400">
            {t('تابعنا بانتظام للاطلاع على المستجدات والفعاليات.', 'Check back soon for latest announcements.')}
          </p>
        </div>
      )}

      {!loading && !error && newsList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((item) => (
            <article
              key={item.id}
              className="group bg-[#0f0f13] border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-all"
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
                    <Calendar className="w-12 h-12" />
                  </div>
                )}
                {item.category_name && (
                  <span className="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-0.5 rounded bg-black/80 text-neutral-200 border border-neutral-700/60 backdrop-blur-sm">
                    {item.category_name}
                  </span>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.published_at || item.created_at).toLocaleDateString('ar-LY')}</span>
                    {item.author && (
                      <>
                        <span>·</span>
                        <span>{item.author}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-red-400 transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  {item.content && (
                    <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedArticle(item)}
                    className="text-xs font-bold text-red-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{t('اقرأ المزيد', 'Read More')}</span>
                    {isRtl ? <ChevronRight className="w-3.5 h-3.5 rotate-180" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-[#111115] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
            <button
              onClick={handleCloseArticle}
              className="absolute top-4 right-4 z-10 p-2 text-neutral-400 hover:text-white rounded-lg bg-black/60 hover:bg-black/80 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedArticle.cover_image && (
              <div className="aspect-[21/9] w-full bg-neutral-900 relative shrink-0">
                <img
                  src={resolveImageUrl(selectedArticle.cover_image, DEFAULT_IMAGES.hero)}
                  alt={selectedArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 sm:p-10 overflow-y-auto space-y-6 flex-1">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                  {selectedArticle.category_name && (
                    <span className="px-2.5 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-900/40 font-bold">
                      {selectedArticle.category_name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{new Date(selectedArticle.published_at || selectedArticle.created_at).toLocaleDateString('ar-LY')}</span>
                  </span>
                  {selectedArticle.author && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{selectedArticle.author}</span>
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black font-heading text-white leading-tight">
                  {selectedArticle.title}
                </h2>
              </div>

              <div className="border-t border-neutral-800/80 pt-6">
                <div className="text-sm sm:text-base text-neutral-300 leading-relaxed space-y-4 whitespace-pre-line font-light">
                  {selectedArticle.content}
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-800 flex justify-between items-center">
                <span className="text-xs text-neutral-400">
                  OXYGEN GYM - طرابلس، ليبيا
                </span>
                <button
                  onClick={handleCloseArticle}
                  className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {t('إغلاق المقال', 'Close Article')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

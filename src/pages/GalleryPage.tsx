import React, { useState, useEffect } from 'react';
import { Camera, X, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MediaItem } from '../types';
import { api } from '../services/api';
import { DEFAULT_IMAGES } from '../lib/media';

export const GalleryPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Predefined default gym gallery items in case uploads are fresh
  const defaultGallery = [
    {
      id: 1,
      filename: 'hero_oxygen_gym',
      url: DEFAULT_IMAGES.hero,
      original_name: 'صالة الأثقال والحديد الرئيسية',
      category: 'الجيم',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      filename: 'equipment_power_racks',
      url: DEFAULT_IMAGES.equipment,
      original_name: 'أقفاص تمارين القوة الاحترافية',
      category: 'المعدات',
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      filename: 'training_boxing_area',
      url: DEFAULT_IMAGES.training,
      original_name: 'حلبة وقسم الفنون القتالية والملاكمة',
      category: 'التمارين',
      created_at: new Date().toISOString(),
    },
    {
      id: 4,
      filename: 'facilities_luxury_gym',
      url: DEFAULT_IMAGES.facilities,
      original_name: 'غرف تبديل الملابس والخزائن الفندقية',
      category: 'المرافق',
      created_at: new Date().toISOString(),
    },
    {
      id: 5,
      filename: 'products_nutrition_showcase',
      url: DEFAULT_IMAGES.products,
      original_name: 'متجر المكملات الغذائية والبروتين',
      category: 'الفعاليات',
      created_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const data = await api.getGallery().catch(() => []);
      if (data && data.length > 0) {
        setMediaList(data);
      } else {
        setMediaList(defaultGallery);
      }
    } catch (e) {
      setMediaList(defaultGallery);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', ar: 'الكل', en: 'All' },
    { id: 'الجيم', ar: 'الجيم', en: 'Gym Floor' },
    { id: 'المعدات', ar: 'المعدات', en: 'Equipment' },
    { id: 'التمارين', ar: 'التمارين', en: 'Training' },
    { id: 'المرافق', ar: 'المرافق', en: 'Facilities' },
    { id: 'الفعاليات', ar: 'الفعاليات', en: 'Events' },
  ];

  const filteredMedia =
    selectedCategory === 'all'
      ? mediaList
      : mediaList.filter(
          (m: any) =>
            m.category === selectedCategory ||
            m.original_name?.includes(selectedCategory) ||
            m.filename?.includes(selectedCategory)
        );

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredMedia.length);
    }
  };

  const prevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredMedia.length) % filteredMedia.length);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
          {t('معرض الوسائط', 'Photo Gallery')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
          {t('صور OXYGEN GYM', 'Oxygen Gym Gallery')}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          {t(
            'جولة بصرية واقعية في أروقة النادي، أجهزة التدريب، حلبة الفنون القتالية، ومرافق النادي.',
            'A visual tour of our fitness floor, equipment, boxing ring, and facilities.'
          )}
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-red-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800'
            }`}
          >
            {t(cat.ar, cat.en)}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-20 text-neutral-500">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">{t('جاري تحميل الصور...', 'Loading gallery...')}</p>
        </div>
      )}

      {/* Gallery Grid */}
      {!loading && filteredMedia.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => openLightbox(idx)}
              className="group relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 aspect-[4/3] cursor-pointer"
            >
              <img
                src={item.url}
                alt={item.original_name || 'Oxygen Gym'}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 justify-between">
                <span className="text-xs font-bold text-white line-clamp-1">
                  {item.original_name || 'OXYGEN GYM'}
                </span>
                <Maximize2 className="w-4 h-4 text-red-400 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredMedia[lightboxIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md animate-fadeIn">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 p-3 text-neutral-300 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Controls */}
          {filteredMedia.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevLightbox();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 text-neutral-300 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextLightbox();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 text-neutral-300 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="max-w-5xl max-h-[85vh] relative flex flex-col items-center">
            <img
              src={filteredMedia[lightboxIndex].url}
              alt="Oxygen Gym Gallery Preview"
              referrerPolicy="no-referrer"
              className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
            />
            {filteredMedia[lightboxIndex].original_name && (
              <p className="mt-3 text-xs sm:text-sm text-neutral-300 font-medium">
                {filteredMedia[lightboxIndex].original_name}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

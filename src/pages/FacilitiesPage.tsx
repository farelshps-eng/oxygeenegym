import React, { useState, useEffect } from 'react';
import { Building, X, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Facility } from '../types';
import { api } from '../services/api';
import { DEFAULT_IMAGES, resolveImageUrl } from '../lib/media';

interface FacilitiesPageProps {
  initialSlug?: string;
  onClearInitialSlug?: () => void;
}

export const FacilitiesPage: React.FC<FacilitiesPageProps> = ({
  initialSlug,
  onClearInitialSlug,
}) => {
  const { t, isRtl } = useLanguage();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFacilities();
      setFacilities(data);
      if (initialSlug) {
        const match = data.find((f) => f.slug === initialSlug);
        if (match) setSelectedFacility(match);
      }
    } catch (err) {
      setError(t('حدث خطأ أثناء تحميل المرافق.', 'Failed to load facilities.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedFacility(null);
    if (onClearInitialSlug) onClearInitialSlug();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
          {t('الخدمات والتجهيزات', 'Club Amenities')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
          {t('مرافق OXYGEN GYM', 'Oxygen Gym Facilities')}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          {t(
            'مرافق فندقية وخدمات نظافة مستمرة لضمان أقصى درجات الراحة والخصوصية لكل رياضي ومشترك.',
            'Pristine amenities including private lockers, luxury showers, and dedicated conditioning zones.'
          )}
        </p>
      </div>

      {loading && (
        <div className="text-center py-20 text-neutral-500 space-y-2">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">{t('جاري تحميل المرافق...', 'Loading facilities...')}</p>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-16 p-6 bg-red-950/20 border border-red-900/40 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && facilities.length === 0 && (
        <div className="text-center py-20 bg-[#0f0f13] border border-neutral-800 rounded-2xl p-8 space-y-3">
          <Building className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {t('لا توجد مرافق مضافة حاليًا', 'No facilities listed')}
          </h3>
          <p className="text-xs text-neutral-400">
            {t('يمكن لإدارة الجيم إضافة المرافق عبر لوحة الإدارة.', 'Gym management will publish amenities here.')}
          </p>
        </div>
      )}

      {!loading && !error && facilities.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className="group bg-[#0f0f13] border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-all"
            >
              <div className="aspect-[4/3] bg-neutral-900 relative overflow-hidden">
                {facility.image_url ? (
                  <img
                    src={resolveImageUrl(facility.image_url, DEFAULT_IMAGES.facilities)}
                    alt={facility.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    <Building className="w-16 h-16" />
                  </div>
                )}
                {facility.category && (
                  <span className="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-0.5 rounded bg-black/80 text-neutral-200 border border-neutral-700/60 backdrop-blur-sm">
                    {facility.category}
                  </span>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors mb-2">
                    {facility.name}
                  </h3>
                  {facility.description && (
                    <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                      {facility.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedFacility(facility)}
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

      {/* Facility Detail Modal */}
      {selectedFacility && (
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
              {selectedFacility.image_url ? (
                <img
                  src={resolveImageUrl(selectedFacility.image_url, DEFAULT_IMAGES.facilities)}
                  alt={selectedFacility.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600">
                  <Building className="w-16 h-16" />
                </div>
              )}
              {selectedFacility.category && (
                <span className="absolute bottom-4 right-4 text-xs font-bold px-3 py-1 rounded-lg bg-black/80 text-red-400 border border-red-900/40">
                  {selectedFacility.category}
                </span>
              )}
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-5 flex-1">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mb-2">
                  {selectedFacility.name}
                </h3>
                {selectedFacility.description && (
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {selectedFacility.description}
                  </p>
                )}
              </div>

              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-xs text-neutral-400">
                <span className="text-white font-semibold block mb-1">
                  {t('معايير النظافة والتعقيم', 'Hygiene Standards')}
                </span>
                <p>
                  {t(
                    'تخضع كافة المرافق لبروتوكول تعقيم دوري ومستمر على مدار اليوم للحفاظ على أعلى مستويات الصحة والسلامة لرواد أوكسجين جيم.',
                    'All facilities undergo rigorous daily sterilization to maintain maximum comfort and safety.'
                  )}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
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

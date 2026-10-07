import React from 'react';
import { X, MapPin, Building2, Phone, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SiteSettings } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
  settings?: SiteSettings;
  onViewLocation?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  planName,
  settings,
  onViewLocation,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const mapUrl =
    settings?.google_maps_url ||
    'https://www.google.com/maps/search/?api=1&query=R84G%2BX2P+Tripoli+Libya';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#111115] border border-neutral-800 rounded-xl p-6 sm:p-8 text-neutral-100 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-600/10 border border-red-600/20 text-red-500 rounded-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading text-white">
              {planName
                ? t(`الاشتراك في: ${planName}`, `Subscribe to: ${planName}`)
                : t('الاشتراك في أوكسجين جيم', 'Join Oxygen Gym')}
            </h3>
            <p className="text-xs text-neutral-400">
              {t('تنبيه هام حول إجراءات الاشتراك', 'Important Membership Notice')}
            </p>
          </div>
        </div>

        {/* Primary In-Gym Notice Banner */}
        <div className="mb-6 p-4 bg-neutral-900 border border-neutral-700/60 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                {t('الاشتراك يتم حضوريًا داخل مقر الجيم فقط', 'Subscriptions are in-person only')}
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {t(
                  'حرصاً على تقديم أفضل تجربة رياضية، لا يتوفر دفع أو اشتراك إلكتروني عبر الموقع. يرجى زيارة مكتب الاستقبال في النادي لإتمام إجراءات التسجيل واستلام بطاقتك وتحديد أهدافك الرياضية.',
                  'To ensure the highest quality experience, online payments and subscriptions are not processed via the website. Please visit our front desk in person to complete registration and obtain your membership card.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Gym Location Details */}
        <div className="space-y-3 mb-6 text-sm text-neutral-300">
          <div className="flex items-center gap-3 p-3 bg-neutral-900/60 rounded-lg border border-neutral-800">
            <MapPin className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <span className="block text-xs text-neutral-400">
                {t('العنوان والموقع', 'Address & Location')}
              </span>
              <span className="font-semibold text-white">
                {settings?.address || 'طريق عين زارة، طرابلس، ليبيا'}
              </span>
              <span className="block text-xs font-mono text-red-400 mt-0.5">
                Google Maps Plus Code: {settings?.plus_code || 'R84G+X2P'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-neutral-900/60 rounded-lg border border-neutral-800">
            <Clock className="w-5 h-5 text-neutral-400 shrink-0" />
            <div>
              <span className="block text-xs text-neutral-400">
                {t('أوقات العمل واستقبال المشتركين', 'Working & Registration Hours')}
              </span>
              <span className="text-white">
                {t('السبت إلى الخميس: 07:00 صباحاً – 11:00 مساءً | الجمعة: 03:00 مساءً – 10:00 مساءً', 'Saturday to Thursday: 07:00 AM – 11:00 PM | Friday: 03:00 PM – 10:00 PM')}
              </span>
            </div>
          </div>

          {settings?.phone && (
            <div className="flex items-center gap-3 p-3 bg-neutral-900/60 rounded-lg border border-neutral-800">
              <Phone className="w-5 h-5 text-neutral-400 shrink-0" />
              <div>
                <span className="block text-xs text-neutral-400">
                  {t('هاتف الاستفسارات', 'Inquiry Phone')}
                </span>
                <a href={`tel:${settings.phone}`} className="text-white font-mono hover:text-red-400 transition-colors">
                  {settings.phone}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-center text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            {t('فتح الموقع على Google Maps', 'Open in Google Maps')}
          </a>

          {onViewLocation && (
            <button
              onClick={() => {
                onClose();
                onViewLocation();
              }}
              className="py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-semibold rounded-lg transition-colors text-center"
            >
              {t('عرض صفحة الموقع', 'View Location Page')}
            </button>
          )}

          <button
            onClick={onClose}
            className="py-3 px-4 bg-transparent border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-sm font-semibold rounded-lg transition-colors"
          >
            {t('إغلاق', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};

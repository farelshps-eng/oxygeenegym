import React from 'react';
import { MapPin, Phone, Mail, Instagram, Facebook, Shield, ArrowUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SiteSettings, SocialLink } from '../types';
import { GymLogo } from './GymLogo';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenSubscribe: () => void;
  settings?: SiteSettings;
  socialLinks?: SocialLink[];
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenSubscribe,
  settings,
  socialLinks = [],
}) => {
  const { t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mapUrl =
    settings?.google_maps_url ||
    'https://www.google.com/maps/search/?api=1&query=R84G%2BX2P+Tripoli+Libya';

  return (
    <footer className="w-full bg-[#060608] border-t border-neutral-800 text-neutral-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <div>
              <GymLogo size="md" />
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {settings?.description ||
                t(
                  'أوكسجين جيم - صرح تدريبي متكامل مجهز بأحدث المعدات الرياضية وقاعات الفنون القتالية ومرافق الراحة في طرابلس.',
                  'Oxygen Gym - A state-of-the-art training facility equipped with modern gym machinery, combat sports arena, and wellness amenities in Tripoli, Libya.'
                )}
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.length > 0 ? (
                socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-red-600 transition-colors"
                    title={link.platform}
                  >
                    {link.platform.toLowerCase().includes('instagram') ? (
                      <Instagram className="w-4 h-4" />
                    ) : link.platform.toLowerCase().includes('facebook') ? (
                      <Facebook className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">{link.platform.slice(0, 2)}</span>
                    )}
                  </a>
                ))
              ) : (
                <>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-red-600 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-red-600 transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t('أقسام الموقع', 'Navigation')}
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { id: 'guide', ar: 'دليل الموقع الشامل 💡', en: 'Site Guide 💡' },
                { id: 'equipment', ar: 'المعدات والأجهزة', en: 'Equipment' },
                { id: 'training', ar: 'التمارين والرياضات', en: 'Training & Sports' },
                { id: 'trainers', ar: 'المدربين المعتمدين', en: 'Trainers' },
                { id: 'memberships', ar: 'باقات الاشتراك والأسعار', en: 'Memberships' },
                { id: 'facilities', ar: 'المرافق والخدمات', en: 'Facilities' },
                { id: 'news', ar: 'أخبار وفعاليات الجيم', en: 'News & Updates' },
                { id: 'products', ar: 'كتالوج المنتجات والمكملات', en: 'Products Catalog' },
                { id: 'gallery', ar: 'معرض صور الجيم', en: 'Photo Gallery' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      scrollToTop();
                    }}
                    className="text-neutral-400 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    {t(item.ar, item.en)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Location & Physical Visit */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t('الموقع والزيارة', 'Location & Visit')}
            </h4>
            <div className="space-y-2 text-xs text-neutral-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium block">
                    {settings?.address || 'طريق عين زارة، طرابلس، ليبيا'}
                  </span>
                  <span className="text-neutral-400 font-mono text-[11px]">
                    Plus Code: {settings?.plus_code || 'R84G+X2P'}
                  </span>
                </div>
              </div>

              {settings?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-500 shrink-0" />
                  <a href={`tel:${settings.phone}`} className="hover:text-white font-mono">
                    {settings.phone}
                  </a>
                </div>
              )}

              {settings?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-neutral-500 shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-white">
                    {settings.email}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded-lg transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>{t('فتح الموقع في خرائط Google', 'Open in Google Maps')}</span>
              </a>
            </div>
          </div>

          {/* Col 4: In-Gym Policy Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t('سياسة الاشتراك', 'Membership Policy')}
            </h4>
            <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-lg text-xs leading-relaxed text-neutral-400">
              <p className="text-white font-semibold mb-1">
                {t('الاشتراك يتم حضوريًا داخل الجيم', 'Subscription is in-person only')}
              </p>
              <p>
                {t(
                  'الموقع منصة رقمية تعريفية. لا يوجد دفع إلكتروني أو معاملات مالية عبر الإنترنت. للاشتراك أو الشراء، نرحب بزيارتكم في صالتنا.',
                  'This website is an informational presentation. There are no online payments or credit card processing. Subscriptions and products are acquired directly in-gym.'
                )}
              </p>
            </div>
            <button
              onClick={onOpenSubscribe}
              className="w-full py-2 px-3 bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
            >
              {t('كيفية الاشتراك وزيارة الجيم', 'How to Join & Visit')}
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>
            © {new Date().getFullYear()} {settings?.gym_name || 'OXYGEN GYM'}.{' '}
            {t('جميع الحقوق محفوظة - طرابلس، ليبيا.', 'All rights reserved - Tripoli, Libya.')}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('admin')}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-neutral-400" />
              <span>{t('لوحة الإدارة', 'Admin Portal')}</span>
            </button>

            <button
              onClick={scrollToTop}
              className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title={t('العودة للأعلى', 'Scroll to Top')}
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

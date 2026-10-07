import React from 'react';
import { X, MessageSquare, Phone, MapPin, AlertCircle, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Product, SiteSettings } from '../types';
import { DEFAULT_IMAGES, resolveImageUrl } from '../lib/media';

interface ProductInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  settings?: SiteSettings;
}

export const ProductInquiryModal: React.FC<ProductInquiryModalProps> = ({
  isOpen,
  onClose,
  product,
  settings,
}) => {
  const { t } = useLanguage();

  if (!isOpen || !product) return null;

  const phone = settings?.phone || settings?.whatsapp || '+218911234567';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const inquiryText = encodeURIComponent(
    `السلام عليكم، أود الاستفسار عن توفر منتج: ${product.name} المعروض في صالة أوكسجين جيم.`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${inquiryText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#111115] border border-neutral-800 rounded-xl p-6 sm:p-8 text-neutral-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-600/10 border border-red-600/20 text-red-500 rounded-lg">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading text-white">
              {t('استفسار عن منتج', 'Product Inquiry')}
            </h3>
            <p className="text-xs text-neutral-400">{product.name}</p>
          </div>
        </div>

        {/* Product Summary */}
        <div className="flex gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-lg mb-6">
          {product.image_url ? (
            <img
              src={resolveImageUrl(product.image_url, DEFAULT_IMAGES.products)}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg bg-neutral-950 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-neutral-800 flex items-center justify-center text-xs text-neutral-500 shrink-0">
              {t('لا توجد صورة', 'No image')}
            </div>
          )}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs text-red-400 font-medium">{product.category_name}</span>
              <h4 className="text-sm font-bold text-white line-clamp-2">{product.name}</h4>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold text-white tabular-nums">
                {product.price > 0 ? `${product.price} ${product.currency}` : t('السعر عند الطلب', 'Price on inquiry')}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                {product.availability_status || t('متوفر بالصالة', 'In Stock')}
              </span>
            </div>
          </div>
        </div>

        {/* Policy notice: Strictly No online checkout */}
        <div className="mb-6 p-4 bg-neutral-900/60 border border-neutral-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-300 leading-relaxed">
            {t(
              'المنتجات المعروضة مخصصة للاطلاع والشراء المباشر من داخل مقر أوكسجين جيم. لا يوجد طلب أو شحن إلكتروني. للاستفسار والحجز المباشر بالصالة، تفضل بالتواصل معنا عبر واتساب أو الهاتف.',
              'Items shown in the catalog are available for direct in-person purchase at Oxygen Gym. There is no online checkout or shipping. Please contact us via WhatsApp or phone for immediate availability.'
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            {t('تواصل واستفسر عبر واتساب', 'Inquire via WhatsApp')}
          </a>

          {settings?.phone && (
            <a
              href={`tel:${settings.phone}`}
              className="w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-center text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              {t('اتصال مباشر بمكتب الاستقبال', 'Direct Call Front Desk')} ({settings.phone})
            </a>
          )}

          {product.external_info_url && (
            <a
              href={product.external_info_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-transparent border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs font-medium text-center rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t('رابط مواصفات المنتج الخارجية', 'External Product Specs')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

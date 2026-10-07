import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, X, MessageSquare, Phone, ExternalLink, AlertCircle, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Product, Category, SiteSettings } from '../types';
import { api } from '../services/api';
import { DEFAULT_IMAGES, resolveImageUrl } from '../lib/media';

interface ProductsPageProps {
  initialSlug?: string;
  onClearInitialSlug?: () => void;
  onOpenInquiry: (product: Product) => void;
  settings?: SiteSettings;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  initialSlug,
  onClearInitialSlug,
  onOpenInquiry,
  settings,
}) => {
  const { t, isRtl } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodData, catData] = await Promise.all([
        api.getProducts({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
        }),
        api.getProductCategories(),
      ]);
      const filtered = searchQuery
        ? prodData.filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.description?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : prodData;

      setProducts(filtered);
      setCategories(catData);

      if (initialSlug) {
        const match = prodData.find((p) => p.slug === initialSlug);
        if (match) setSelectedProduct(match);
      }
    } catch (err) {
      setError(t('حدث خطأ أثناء تحميل كتالوج المنتجات.', 'Failed to load products.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
    if (onClearInitialSlug) onClearInitialSlug();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
          {t('كتالوج المنتجات والمكملات', 'Gym Store Catalog')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
          {t('منتجات OXYGEN GYM', 'Oxygen Gym Products')}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          {t(
            'تصفح المكملات الغذائية، البروتين، الكرياتين، والملابس الرياضية المعروضة داخل صالة الجيم للاستلام والشراء المباشر.',
            'Browse nutritional supplements, protein, and gym apparel available for direct in-gym purchase.'
          )}
        </p>
      </div>

      {/* Strict Policy Banner */}
      <div className="p-4 bg-[#14141a] border border-neutral-800 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-300 leading-relaxed">
          <span className="font-bold text-white block mb-0.5">
            {t('كتالوج استعراض واطلاع فقط — الشراء والاستلام حصرياً داخل الجيم', 'Information catalog only — In-gym direct acquisition')}
          </span>
          {t(
            'لا يحتوي الموقع على سلة تسوق أو دفع إلكتروني أو شحن. المنتجات معروضة للتعريف بالأسعار والتوفر بصالة أوكسجين جيم. للاستفسار أو التأكد من التوفر تفضل بزيارتنا أو تواصل عبر زر الاستفسار.',
            'This catalog is for presentation purposes. There is NO checkout, shipping, or payment processing. Inquire via WhatsApp or visit our gym desk.'
          )}
        </div>
      </div>

      {/* Filter & Search */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('ابحث في كتالوج المنتجات والمكملات...', 'Search products...')}
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
            {t('جميع المنتجات', 'All Products')}
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

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-neutral-500 space-y-2">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">{t('جاري تحميل المنتجات...', 'Loading products...')}</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-16 p-6 bg-red-950/20 border border-red-900/40 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20 bg-[#0f0f13] border border-neutral-800 rounded-2xl p-8 space-y-3">
          <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {t('لا توجد منتجات مطابقة حاليًا', 'No products found')}
          </h3>
          <p className="text-xs text-neutral-400">
            {t('يمكن لإدارة الجيم إضافة منتجات ومكملات جديدة عبر لوحة التحكم.', 'Products will be updated soon.')}
          </p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-[#0f0f13] border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-all"
            >
              <div className="aspect-square bg-neutral-900 relative overflow-hidden">
                {product.image_url ? (
                  <img
                    src={resolveImageUrl(product.image_url, DEFAULT_IMAGES.products)}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    <ShoppingBag className="w-12 h-12" />
                  </div>
                )}
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded bg-black/80 text-emerald-400 border border-emerald-900/40 backdrop-blur-sm">
                  {product.availability_status || t('متوفر بالصالة', 'In Stock')}
                </span>
                {product.category_name && (
                  <span className="absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded bg-black/80 text-neutral-300">
                    {product.category_name}
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-base font-black font-heading text-white tabular-nums">
                      {product.price > 0 ? product.price : t('حسب الطلب', 'Inquire')}
                    </span>
                    {product.price > 0 && (
                      <span className="text-[11px] text-neutral-400 mr-1 font-bold">{product.currency}</span>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="text-xs font-bold text-red-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{t('عرض المنتج', 'View Product')}</span>
                    {isRtl ? <ChevronRight className="w-3.5 h-3.5 rotate-180" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
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
              {selectedProduct.image_url ? (
                <img
                  src={resolveImageUrl(selectedProduct.image_url, DEFAULT_IMAGES.products)}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600">
                  <ShoppingBag className="w-16 h-16" />
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded bg-black/80 text-emerald-400 border border-emerald-900/40">
                  {selectedProduct.availability_status || t('متوفر بالصالة', 'In Stock')}
                </span>
                {selectedProduct.category_name && (
                  <span className="text-xs font-bold px-3 py-1 rounded bg-black/80 text-neutral-300 border border-neutral-700">
                    {selectedProduct.category_name}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mb-2">
                  {selectedProduct.name}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black font-heading text-red-500 tabular-nums">
                    {selectedProduct.price > 0
                      ? `${selectedProduct.price} ${selectedProduct.currency}`
                      : t('السعر عند الاستفسار', 'Price upon inquiry')}
                  </span>
                </div>
              </div>

              {selectedProduct.description && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    {t('وصف ومواصفات المنتج', 'Description')}
                  </h4>
                  <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              {/* In-Gym notice */}
              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {t(
                    'المنتج متاح للاستلام والشراء المباشر من مكتب الاستقبال داخل مقر أوكسجين جيم بطريق عين زارة، طرابلس.',
                    'Available for direct pickup at Oxygen Gym front desk on Ain Zara Road, Tripoli.'
                  )}
                </p>
              </div>

              {/* Action Buttons: Strictly Inquire / Contact */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    handleCloseDetail();
                    onOpenInquiry(selectedProduct);
                  }}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t('استفسر عن المنتج', 'Inquire About Product')}</span>
                </button>

                {selectedProduct.external_info_url && (
                  <a
                    href={selectedProduct.external_info_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{t('تفاصيل إضافية', 'External Specs')}</span>
                  </a>
                )}

                <button
                  onClick={handleCloseDetail}
                  className="py-3 px-4 bg-transparent border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
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

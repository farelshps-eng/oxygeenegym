import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SiteSettings, SocialLink } from '../types';
import { api } from '../services/api';

interface LocationContactPageProps {
  settings?: SiteSettings;
  socialLinks?: SocialLink[];
  mode?: 'all' | 'location' | 'contact' | 'about';
}

export const LocationContactPage: React.FC<LocationContactPageProps> = ({
  settings,
  socialLinks = [],
  mode = 'all',
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setError(t('يرجى ملء جميع الحقول المطلوبة.', 'Please fill out all required fields.'));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.sendContactMessage(formData);
      setSuccess(true);
      setFormData({ name: '', phone: '', message: '' });
    } catch (err: any) {
      setError(err.message || t('فشل إرسال الرسالة. حاول ثانية.', 'Failed to send message.'));
    } finally {
      setSubmitting(false);
    }
  };

  const mapUrl =
    settings?.google_maps_url ||
    'https://www.google.com/maps/search/?api=1&query=R84G%2BX2P+Tripoli+Libya';

  const showStats =
    settings?.show_stats !== '0' &&
    (settings?.stat_equipment || settings?.stat_area || settings?.stat_programs || settings?.stat_coaches);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
          {t('الموقع والتواصل', 'Location & Contact')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
          {t('تواصل مع OXYGEN GYM', 'Contact & Find Us')}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          {t(
            'نرحب بزيارتكم في صالتنا بطريق عين زارة في طرابلس. لا تتردد في الاتصال أو مراسلتنا للاستفسار.',
            'Visit us on Ain Zara Road, Tripoli or reach out directly with any questions.'
          )}
        </p>
      </div>

      {/* 1. ABOUT OXYGEN GYM (Configurable) */}
      {(mode === 'all' || mode === 'about') && (
        <div className="bg-[#0f0f13] border border-neutral-800 rounded-2xl p-8 sm:p-12 space-y-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
              {t('نبذة تعريفية', 'About Us')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
              {settings?.about_title || 'عن OXYGEN GYM'}
            </h2>
            <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
              {settings?.about_text ||
                t(
                  'نادي أوكسجين جيم هو صرح رياضي متكامل في طرابلس بطريق عين زارة. تم تجهيز النادي بأحدث المعدات الرياضية وأقوى التجهيزات العالمية لضمان تجربة تدريب احترافية وممتعة تناسب جميع المستويات، تحت إشراف نخبة من المدربين المعتمدين.',
                  'Oxygen Gym is an athletic powerhouse in Tripoli on Ain Zara Road, equipped with elite equipment and certified trainers.'
                )}
            </p>
          </div>

          {/* Statistics (Only shown if data exists) */}
          {showStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-neutral-800">
              {settings?.stat_equipment && (
                <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-center">
                  <span className="block text-2xl sm:text-3xl font-black font-heading text-red-500 tabular-nums">
                    {settings.stat_equipment}
                  </span>
                  <span className="text-xs text-neutral-400 mt-1 block">
                    {t('معدة وجهاز تمرين', 'Machines & Equipment')}
                  </span>
                </div>
              )}
              {settings?.stat_area && (
                <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-center">
                  <span className="block text-2xl sm:text-3xl font-black font-heading text-white tabular-nums">
                    {settings.stat_area}
                  </span>
                  <span className="text-xs text-neutral-400 mt-1 block">
                    {t('مساحة الصالة', 'Gym Floor Area')}
                  </span>
                </div>
              )}
              {settings?.stat_programs && (
                <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-center">
                  <span className="block text-2xl sm:text-3xl font-black font-heading text-white tabular-nums">
                    {settings.stat_programs}
                  </span>
                  <span className="text-xs text-neutral-400 mt-1 block">
                    {t('برامج ورياضات', 'Programs & Sports')}
                  </span>
                </div>
              )}
              {settings?.stat_coaches && (
                <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-center">
                  <span className="block text-2xl sm:text-3xl font-black font-heading text-white tabular-nums">
                    {settings.stat_coaches}
                  </span>
                  <span className="text-xs text-neutral-400 mt-1 block">
                    {t('مدربين معتمدين', 'Certified Trainers')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. LOCATION & MAP SECTION */}
      {(mode === 'all' || mode === 'location') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-[#0f0f13] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-600/10 border border-red-600/20 text-red-500 rounded-xl">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">
                    {settings?.gym_name || 'OXYGEN GYM'}
                  </h3>
                  <span className="text-xs text-neutral-400">طرابلس، ليبيا</span>
                </div>
              </div>

              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                  {t('العنوان الرسمي', 'Official Address')}
                </span>
                <p className="text-sm font-semibold text-white">
                  {settings?.address || 'طريق عين زارة، طرابلس، ليبيا'}
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Google Maps Plus Code:</span>
                  <span className="font-mono text-red-400 font-bold text-xs">
                    {settings?.plus_code || 'R84G+X2P'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-neutral-400 font-bold">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span>{t('أوقات العمل واستقبال المشتركين', 'Operating Hours')}</span>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  {t(
                    'السبت – الخميس: 07:00 صباحاً – 11:00 مساءً\nالجمعة: 03:00 مساءً – 10:00 مساءً',
                    'Sat – Thu: 07:00 AM – 11:00 PM\nFri: 03:00 PM – 10:00 PM'
                  )}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-2 text-center"
              >
                <MapPin className="w-4 h-4" />
                <span>{t('فتح الموقع على Google Maps', 'Open in Google Maps')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Interactive Map Visual */}
          <div className="lg:col-span-7 bg-[#0f0f13] border border-neutral-800 rounded-2xl overflow-hidden min-h-[350px] relative flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-neutral-900 to-[#0a0a0c]">
            <div className="space-y-4 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto shadow-xl shadow-red-950/40">
                <Building2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold font-heading text-white">
                OXYGEN GYM - طرابلس
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                طريق عين زارة الرئيسي، طرابلس، ليبيا
                <br />
                <span className="font-mono text-red-400 font-bold mt-1 inline-block">
                  Plus Code: {settings?.plus_code || 'R84G+X2P'}
                </span>
              </p>
              <div className="pt-2">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white font-semibold text-xs rounded-lg transition-colors"
                >
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{t('توجيه الملاحة عبر خرائط جوجل', 'Navigate with Google Maps')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTACT CHANNELS & FORM */}
      {(mode === 'all' || mode === 'contact') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details */}
          <div className="lg:col-span-5 bg-[#0f0f13] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
                {t('قنوات التواصل', 'Channels')}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mt-1">
                {t('وسائل التواصل الرسمية', 'Official Contact Channels')}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                {t('فريقنا متاح للإجابة على استفساراتكم ومساعدتكم.', 'Our staff is available to answer all questions.')}
              </p>
            </div>

            <div className="space-y-3">
              {/* Phone (Hide if empty) */}
              {settings?.phone && (
                <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-red-500" />
                    <div>
                      <span className="text-[11px] text-neutral-500 block">{t('الهاتف', 'Phone')}</span>
                      <a href={`tel:${settings.phone}`} className="text-sm font-bold text-white font-mono hover:text-red-400">
                        {settings.phone}
                      </a>
                    </div>
                  </div>
                  <a
                    href={`tel:${settings.phone}`}
                    className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-xs rounded text-neutral-300"
                  >
                    {t('اتصال', 'Call')}
                  </a>
                </div>
              )}

              {/* WhatsApp (Hide if empty) */}
              {settings?.whatsapp && (
                <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 text-emerald-500 font-bold">WA</div>
                    <div>
                      <span className="text-[11px] text-neutral-500 block">{t('واتساب', 'WhatsApp')}</span>
                      <span className="text-sm font-bold text-white font-mono">{settings.whatsapp}</span>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-xs rounded text-emerald-400 hover:text-white"
                  >
                    {t('مراسلة', 'Chat')}
                  </a>
                </div>
              )}

              {/* Email (Hide if empty) */}
              {settings?.email && (
                <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-red-500" />
                  <div>
                    <span className="text-[11px] text-neutral-500 block">{t('البريد الإلكتروني', 'Email')}</span>
                    <a href={`mailto:${settings.email}`} className="text-sm text-white hover:text-red-400">
                      {settings.email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links (Dynamic from DB) */}
            {socialLinks.length > 0 && (
              <div className="pt-4 border-t border-neutral-800">
                <span className="text-xs font-bold text-neutral-400 block mb-3">
                  {t('حساباتنا على منصات التواصل', 'Social Media')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-red-600 text-xs text-neutral-300 hover:text-white transition-colors"
                    >
                      {s.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Message Form */}
          <div className="lg:col-span-7 bg-[#0f0f13] border border-neutral-800 rounded-2xl p-6 sm:p-8">
            <div>
              <span className="text-xs font-bold tracking-widest text-red-500 uppercase">
                {t('رسالة مباشرة', 'Direct Message')}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mt-1">
                {t('أرسل استفسارك للإدارة', 'Send Us an Inquiry')}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 mb-6">
                {t(
                  'سيتم إرسال رسالتك إلى إدارة الجيم والرد عليك في أقرب وقت. (ملاحظة: هذا النموذج للاستفسارات العامة وليس للحجز الإلكتروني)',
                  'This form is for general questions and inquiries. Subscriptions are completed in-gym.'
                )}
              </p>
            </div>

            {success ? (
              <div className="p-6 bg-emerald-950/30 border border-emerald-800 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">
                  {t('تم استلام رسالتك بنجاح', 'Message Received Successfully')}
                </h4>
                <p className="text-xs text-neutral-300">
                  {t('شكراً لتواصلك مع أوكسجين جيم. سيقوم فريقنا بمراجعة رسالتك والتواصل معك.', 'Thank you for reaching out to Oxygen Gym. We will get back to you shortly.')}
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {t('إرسال رسالة أخرى', 'Send another message')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-950/40 border border-red-900 rounded-lg text-xs text-red-400">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {t('الاسم الكريم', 'Your Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('أدخل اسمك الكامل', 'Full Name')}
                    className="w-full bg-[#111115] border border-neutral-800 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {t('رقم الهاتف للتواصل', 'Phone Number')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="091XXXXXXX"
                    className="w-full bg-[#111115] border border-neutral-800 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600 transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {t('نص الاستفسار أو الرسالة', 'Message / Inquiry')} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t('اكتب استفسارك هنا...', 'Type your inquiry here...')}
                    className="w-full bg-[#111115] border border-neutral-800 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/40"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {submitting
                      ? t('جاري الإرسال...', 'Sending...')
                      : t('إرسال الاستفسار', 'Submit Inquiry')}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

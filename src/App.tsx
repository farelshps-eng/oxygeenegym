/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SubscriptionModal } from './components/SubscriptionModal';
import { ProductInquiryModal } from './components/ProductInquiryModal';
import { MemberAuthModal } from './components/MemberAuthModal';
import { MemberProfileModal } from './components/MemberProfileModal';

// Public Pages
import { HomePage } from './pages/HomePage';
import { EquipmentPage } from './pages/EquipmentPage';
import { TrainingPage } from './pages/TrainingPage';
import { TrainersPage } from './pages/TrainersPage';
import { MembershipsPage } from './pages/MembershipsPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { NewsPage } from './pages/NewsPage';
import { ProductsPage } from './pages/ProductsPage';
import { LocationContactPage } from './pages/LocationContactPage';
import { GalleryPage } from './pages/GalleryPage';
import { SearchPage } from './pages/SearchPage';
import { GuidePage } from './pages/GuidePage';

// Admin System
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout, AdminTab } from './admin/AdminLayout';
import { AdminDashboardHome } from './admin/pages/AdminDashboardHome';
import { AdminMembers } from './admin/pages/AdminMembers';
import { AdminEquipment } from './admin/pages/AdminEquipment';
import { AdminTraining } from './admin/pages/AdminTraining';
import { AdminTrainers } from './admin/pages/AdminTrainers';
import { AdminMemberships } from './admin/pages/AdminMemberships';
import { AdminFacilities } from './admin/pages/AdminFacilities';
import { AdminNews } from './admin/pages/AdminNews';
import { AdminProducts } from './admin/pages/AdminProducts';
import { AdminMedia } from './admin/pages/AdminMedia';
import { AdminMessages } from './admin/pages/AdminMessages';
import { AdminCategories } from './admin/pages/AdminCategories';
import { AdminSettings } from './admin/pages/AdminSettings';
import { AdminSocialLinks } from './admin/pages/AdminSocialLinks';
import { AdminPassword } from './admin/pages/AdminPassword';

import {
  SiteSettings,
  SocialLink,
  Equipment,
  Training,
  Trainer,
  Membership,
  Facility,
  NewsItem,
  Product,
  User,
  Member,
  MemberNotification,
} from './types';
import {
  api,
  getAuthToken,
  clearAuthToken,
  getMemberToken,
  clearMemberToken,
} from './services/api';

export default function App() {
  // Navigation & Page State
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [targetSlug, setTargetSlug] = useState<string | undefined>(undefined);

  // Global Site Data
  const [settings, setSettings] = useState<SiteSettings>({});
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [featuredEquipment, setFeaturedEquipment] = useState<Equipment[]>([]);
  const [featuredTraining, setFeaturedTraining] = useState<Training[]>([]);
  const [featuredMemberships, setFeaturedMemberships] = useState<Membership[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  // Modals
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState<string | undefined>(undefined);
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);

  // Member Portal & Auth State
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [memberNotifications, setMemberNotifications] = useState<MemberNotification[]>([]);
  const [isMemberAuthOpen, setIsMemberAuthOpen] = useState(false);
  const [memberAuthMode, setMemberAuthMode] = useState<'login' | 'register'>('login');
  const [isMemberProfileOpen, setIsMemberProfileOpen] = useState(false);

  // Admin Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  useEffect(() => {
    loadGlobalData();
    checkAdminSession();
    checkMemberSession();
  }, []);

  const loadGlobalData = async () => {
    try {
      const [
        st,
        soc,
        eq,
        trn,
        mem,
        fac,
        nws,
        prods,
      ] = await Promise.all([
        api.getSiteSettings().catch(() => ({})),
        api.getSocialLinks().catch(() => []),
        api.getEquipment({ featured: '1' }).catch(() => []),
        api.getTraining().catch(() => []),
        api.getMemberships().catch(() => []),
        api.getFacilities().catch(() => []),
        api.getNews().catch(() => []),
        api.getProducts({ featured: '1' }).catch(() => []),
      ]);

      setSettings(st);
      setSocialLinks(soc);
      setFeaturedEquipment(eq);
      setFeaturedTraining(trn);
      setFeaturedMemberships(mem);
      setFacilities(fac);
      setLatestNews(nws);
      setFeaturedProducts(prods);
    } catch (err) {
      console.error('Failed to load initial site data:', err);
    }
  };

  const checkAdminSession = async () => {
    const token = getAuthToken();
    if (!token) {
      setCheckingAuth(false);
      return;
    }

    try {
      const res = await api.getMe();
      setCurrentUser(res.user);
    } catch {
      clearAuthToken();
      setCurrentUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  const checkMemberSession = async () => {
    const memberToken = getMemberToken();
    if (!memberToken) return;

    try {
      const res = await api.getMemberMe();
      setCurrentMember(res.member);
      setMemberNotifications(res.notifications || []);
    } catch {
      clearMemberToken();
      setCurrentMember(null);
      setMemberNotifications([]);
    }
  };

  const handleNavigate = (tab: string, extra?: { slug?: string }) => {
    setCurrentTab(tab);
    setTargetSlug(extra?.slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSubscribe = (planName?: string) => {
    setSelectedPlanName(planName);
    setIsSubscribeModalOpen(true);
  };

  const handleOpenInquiry = (product: Product) => {
    setInquiryProduct(product);
  };

  const handleOpenMemberAuth = (mode: 'login' | 'register' = 'login') => {
    setMemberAuthMode(mode);
    setIsMemberAuthOpen(true);
  };

  // ADMIN PORTAL RENDER
  if (currentTab === 'admin') {
    if (checkingAuth) {
      return (
        <div className="min-h-screen bg-[#07070a] flex items-center justify-center text-neutral-400">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    // Admin authentication required
    if (!currentUser) {
      return (
        <AdminLogin
          onSuccess={(user) => {
            setCurrentUser(user);
            setAdminTab('dashboard');
          }}
          onExit={() => setCurrentTab('home')}
        />
      );
    }

    return (
      <AdminLayout
        user={currentUser}
        activeTab={adminTab}
        onSelectTab={setAdminTab}
        onLogout={() => {
          clearAuthToken();
          setCurrentUser(null);
          setCurrentTab('home');
        }}
        onViewPublicSite={() => {
          loadGlobalData();
          setCurrentTab('home');
        }}
      >
        {adminTab === 'dashboard' && <AdminDashboardHome onNavigateTab={setAdminTab} />}
        {adminTab === 'members' && <AdminMembers />}
        {adminTab === 'equipment' && <AdminEquipment />}
        {adminTab === 'training' && <AdminTraining />}
        {adminTab === 'trainers' && <AdminTrainers />}
        {adminTab === 'memberships' && <AdminMemberships />}
        {adminTab === 'facilities' && <AdminFacilities />}
        {adminTab === 'news' && <AdminNews />}
        {adminTab === 'products' && <AdminProducts />}
        {adminTab === 'media' && <AdminMedia />}
        {adminTab === 'messages' && <AdminMessages />}
        {adminTab === 'categories' && <AdminCategories />}
        {adminTab === 'social' && <AdminSocialLinks />}
        {adminTab === 'settings' && <AdminSettings />}
        {adminTab === 'password' && <AdminPassword />}
      </AdminLayout>
    );
  }

  // PUBLIC WEBSITE RENDER
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#07070a] text-neutral-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
        {/* Navigation Bar */}
        <Navbar
          currentTab={currentTab}
          onNavigate={handleNavigate}
          onOpenSubscribe={() => handleOpenSubscribe()}
          settings={settings}
          currentMember={currentMember}
          memberNotifications={memberNotifications}
          onOpenMemberAuth={handleOpenMemberAuth}
          onOpenMemberProfile={() => setIsMemberProfileOpen(true)}
        />

        {/* Main Content View Router */}
        <main className="flex-1">
          {currentTab === 'home' && (
            <HomePage
              onNavigate={handleNavigate}
              onOpenSubscribe={handleOpenSubscribe}
              onOpenInquiry={handleOpenInquiry}
              settings={settings}
              featuredEquipment={featuredEquipment}
              featuredTraining={featuredTraining}
              featuredMemberships={featuredMemberships}
              facilities={facilities}
              latestNews={latestNews}
              featuredProducts={featuredProducts}
            />
          )}

          {currentTab === 'guide' && (
            <GuidePage
              onNavigate={handleNavigate}
              onOpenSubscribe={() => handleOpenSubscribe()}
              onOpenMemberAuth={handleOpenMemberAuth}
            />
          )}

          {currentTab === 'equipment' && (
            <EquipmentPage
              initialSlug={targetSlug}
              onClearInitialSlug={() => setTargetSlug(undefined)}
            />
          )}

          {currentTab === 'training' && (
            <TrainingPage
              initialSlug={targetSlug}
              onNavigateToTrainers={() => handleNavigate('trainers')}
              onClearInitialSlug={() => setTargetSlug(undefined)}
            />
          )}

          {currentTab === 'trainers' && (
            <TrainersPage
              initialSlug={targetSlug}
              onClearInitialSlug={() => setTargetSlug(undefined)}
              onOpenSubscribe={handleOpenSubscribe}
              settings={settings}
            />
          )}

          {currentTab === 'memberships' && (
            <MembershipsPage
              onOpenSubscribe={handleOpenSubscribe}
              onNavigateToLocation={() => handleNavigate('location')}
              settings={settings}
            />
          )}

          {currentTab === 'facilities' && (
            <FacilitiesPage
              initialSlug={targetSlug}
              onClearInitialSlug={() => setTargetSlug(undefined)}
            />
          )}

          {currentTab === 'news' && (
            <NewsPage
              initialSlug={targetSlug}
              onClearInitialSlug={() => setTargetSlug(undefined)}
            />
          )}

          {currentTab === 'products' && (
            <ProductsPage
              initialSlug={targetSlug}
              onClearInitialSlug={() => setTargetSlug(undefined)}
              onOpenInquiry={handleOpenInquiry}
              settings={settings}
            />
          )}

          {currentTab === 'search' && (
            <SearchPage
              onNavigate={handleNavigate}
              onOpenSubscribe={handleOpenSubscribe}
              onOpenInquiry={handleOpenInquiry}
            />
          )}

          {currentTab === 'about' && (
            <LocationContactPage settings={settings} socialLinks={socialLinks} mode="about" />
          )}

          {currentTab === 'location' && (
            <LocationContactPage settings={settings} socialLinks={socialLinks} mode="location" />
          )}

          {currentTab === 'contact' && (
            <LocationContactPage settings={settings} socialLinks={socialLinks} mode="contact" />
          )}

          {currentTab === 'gallery' && <GalleryPage />}
        </main>

        {/* Footer */}
        <Footer
          onNavigate={handleNavigate}
          onOpenSubscribe={() => handleOpenSubscribe()}
          settings={settings}
          socialLinks={socialLinks}
        />

        {/* In-Gym Physical Membership Notice Modal */}
        <SubscriptionModal
          isOpen={isSubscribeModalOpen}
          onClose={() => setIsSubscribeModalOpen(false)}
          planName={selectedPlanName}
          settings={settings}
          onViewLocation={() => handleNavigate('location')}
        />

        {/* Product Direct Inquiry Modal (Catalog Only) */}
        <ProductInquiryModal
          isOpen={!!inquiryProduct}
          onClose={() => setInquiryProduct(null)}
          product={inquiryProduct}
          settings={settings}
        />

        {/* Member Authentication Modal (Login & Questionnaire) */}
        <MemberAuthModal
          isOpen={isMemberAuthOpen}
          onClose={() => setIsMemberAuthOpen(false)}
          initialMode={memberAuthMode}
          onSuccess={(mem, notifs) => {
            setCurrentMember(mem);
            setMemberNotifications(notifs || []);
            setIsMemberProfileOpen(true);
          }}
        />

        {/* Member Profile & Digital Gym Card Modal */}
        {currentMember && (
          <MemberProfileModal
            isOpen={isMemberProfileOpen}
            onClose={() => setIsMemberProfileOpen(false)}
            member={currentMember}
            notifications={memberNotifications}
            onLogout={() => {
              setCurrentMember(null);
              setMemberNotifications([]);
            }}
            onUpdateMember={(updated) => setCurrentMember(updated)}
            onNavigateToLocation={() => handleNavigate('location')}
          />
        )}
      </div>
    </LanguageProvider>
  );
}

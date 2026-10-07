import {
  Equipment,
  Training,
  Trainer,
  Membership,
  Facility,
  NewsItem,
  Product,
  Category,
  SiteSettings,
  SocialLink,
  ContactMessage,
  DashboardStats,
  MediaItem,
  User,
  Member,
  MemberNotification,
  TrainerMessage,
  WorkoutPlanDetails,
} from '../types';

const TOKEN_KEY = 'oxygen_gym_admin_token';
const MEMBER_TOKEN_KEY = 'oxygen_gym_member_token';
const STORED_MEMBER_KEY = 'oxygen_gym_current_member';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getMemberToken(): string | null {
  return localStorage.getItem(MEMBER_TOKEN_KEY);
}

export function setMemberToken(token: string) {
  localStorage.setItem(MEMBER_TOKEN_KEY, token);
}

export function clearMemberToken() {
  localStorage.removeItem(MEMBER_TOKEN_KEY);
  localStorage.removeItem(STORED_MEMBER_KEY);
}

export function getStoredMember(): Member | null {
  try {
    const raw = localStorage.getItem(STORED_MEMBER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredMember(member: Member) {
  try {
    localStorage.setItem(STORED_MEMBER_KEY, JSON.stringify(member));
  } catch {
    // non-fatal
  }
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const adminToken = getAuthToken();
  const memberToken = getMemberToken();
  const headers = new Headers(options.headers || {});

  const isPublicAuth =
    endpoint === '/member/login' ||
    endpoint === '/member/register' ||
    endpoint === '/auth/login';

  if (!isPublicAuth) {
    if (endpoint.startsWith('/member/') && memberToken) {
      headers.set('Authorization', `Bearer ${memberToken}`);
    } else if (adminToken) {
      headers.set('Authorization', `Bearer ${adminToken}`);
    }
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'حدث خطأ في الاتصال بالخادم');
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { username: string; password: string }) =>
    request<{ token: string; user: User; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request<{ user: User }>('/auth/me'),
  changePassword: (passwords: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwords),
    }),

  // Site Settings
  getSiteSettings: () => request<SiteSettings>('/site-settings'),
  updateSiteSettings: (settings: SiteSettings) =>
    request<{ success: boolean; message: string }>('/admin/site-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Public Endpoints
  getEquipment: (params?: { category?: string; search?: string; featured?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.search) q.set('search', params.search);
    if (params?.featured) q.set('featured', params.featured);
    return request<Equipment[]>(`/equipment?${q.toString()}`);
  },
  getEquipmentItem: (slug: string) => request<Equipment>(`/equipment/${slug}`),
  getEquipmentCategories: () => request<Category[]>('/equipment-categories'),

  getTraining: (category?: string) => {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    return request<Training[]>(`/training${q}`);
  },
  getTrainingItem: (slug: string) => request<Training>(`/training/${slug}`),
  getTrainingCategories: () => request<Category[]>('/training-categories'),

  getTrainers: () => request<Trainer[]>('/trainers'),
  getTrainerItem: (slug: string) => request<Trainer>(`/trainers/${slug}`),

  getMemberships: () => request<Membership[]>('/memberships'),

  getFacilities: () => request<Facility[]>('/facilities'),
  getFacilityItem: (slug: string) => request<Facility>(`/facilities/${slug}`),

  getNews: (params?: { category?: string; featured?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.featured) q.set('featured', params.featured);
    return request<NewsItem[]>(`/news?${q.toString()}`);
  },
  getNewsItem: (slug: string) => request<NewsItem>(`/news/${slug}`),
  getNewsCategories: () => request<Category[]>('/news-categories'),

  getProducts: (params?: { category?: string; featured?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.featured) q.set('featured', params.featured);
    return request<Product[]>(`/products?${q.toString()}`);
  },
  getProductItem: (slug: string) => request<Product>(`/products/${slug}`),
  getProductCategories: () => request<Category[]>('/product-categories'),

  getSocialLinks: () => request<SocialLink[]>('/social-links'),
  getGallery: () => request<MediaItem[]>('/gallery'),

  searchGlobal: (query: string, type: string = 'all') =>
    request<{
      equipment?: Equipment[];
      training?: Training[];
      trainers?: Trainer[];
      memberships?: Membership[];
      facilities?: Facility[];
      news?: NewsItem[];
      products?: Product[];
    }>(`/search?q=${encodeURIComponent(query)}&type=${type}`),

  sendContactMessage: (msg: { name: string; phone: string; message: string }) =>
    request<{ success: boolean; message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(msg),
    }),

  // Admin Dashboard
  getAdminStats: () => request<DashboardStats>('/admin/stats'),

  // Admin Equipment
  getAdminEquipment: () => request<Equipment[]>('/admin/equipment'),
  createEquipment: (data: Partial<Equipment>) =>
    request<{ success: boolean; id: number; message: string }>('/admin/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEquipment: (id: number, data: Partial<Equipment>) =>
    request<{ success: boolean; message: string }>(`/admin/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEquipment: (id: number) =>
    request<{ success: boolean; message: string }>(`/admin/equipment/${id}`, {
      method: 'DELETE',
    }),
  toggleEquipmentPublish: (id: number) =>
    request<{ success: boolean; is_published: number }>(`/admin/equipment/${id}/toggle-publish`, {
      method: 'PATCH',
    }),
  toggleEquipmentFeatured: (id: number) =>
    request<{ success: boolean; is_featured: number }>(`/admin/equipment/${id}/toggle-featured`, {
      method: 'PATCH',
    }),

  // Admin Training
  getAdminTraining: () => request<Training[]>('/admin/training'),
  createTraining: (data: Partial<Training>) =>
    request<{ success: boolean; id: number; message: string }>('/admin/training', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTraining: (id: number, data: Partial<Training>) =>
    request<{ success: boolean; message: string }>(`/admin/training/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTraining: (id: number) =>
    request<{ success: boolean; message: string }>(`/admin/training/${id}`, {
      method: 'DELETE',
    }),

  // Admin Trainers
  getAdminTrainers: () => request<Trainer[]>('/admin/trainers'),
  createTrainer: (data: Partial<Trainer>) =>
    request<{ success: boolean; id: number; message: string }>('/admin/trainers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTrainer: (id: number, data: Partial<Trainer>) =>
    request<{ success: boolean; message: string }>(`/admin/trainers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTrainer: (id: number) =>
    request<{ success: boolean; message: string }>(`/admin/trainers/${id}`, {
      method: 'DELETE',
    }),

  // Admin Memberships
  getAdminMemberships: () => request<Membership[]>('/admin/memberships'),
  createMembership: (data: Partial<Membership>) =>
    request<{ success: boolean; id: number; message: string }>('/admin/memberships', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMembership: (id: number, data: Partial<Membership>) =>
    request<{ success: boolean; message: string }>(`/admin/memberships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMembership: (id: number) =>
    request<{ success: boolean; message: string }>(`/admin/memberships/${id}`, {
      method: 'DELETE',
    }),

  // Admin Facilities
  getAdminFacilities: () => request<Facility[]>('/admin/facilities'),
  createFacility: (data: Partial<Facility>) =>
    request<{ success: boolean; id: number; message: string }>('/admin/facilities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateFacility: (id: number, data: Partial<Facility>) =>
    request<{ success: boolean; message: string }>(`/admin/facilities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteFacility: (id: number) =>
    request<{ success: boolean; message: string }>(`/admin/facilities/${id}`, {
      method: 'DELETE',
    }),

  // Admin News
  getAdminNews: () => request<NewsItem[]>('/admin/news'),
  createNews: (data: Partial<NewsItem>) =>
    request<{ success: boolean; id: number; message: string }>('/admin/news', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateNews: (id: number, data: Partial<NewsItem>) =>
    request<{ success: boolean; message: string }>(`/admin/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteNews: (id: number) =>
    request<{ success: boolean; message: string }>(`/admin/news/${id}`, {
      method: 'DELETE',
    }),

  // Admin Products
  getAdminProducts: () => request<Product[]>('/admin/products'),
  createProduct: (data: Partial<Product>) =>
    request<{ success: boolean; id: number; message: string }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProduct: (id: number, data: Partial<Product>) =>
    request<{ success: boolean; message: string }>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: number) =>
    request<{ success: boolean; message: string }>(`/admin/products/${id}`, {
      method: 'DELETE',
    }),

  // Admin Media
  getMedia: () => request<MediaItem[]>('/admin/media'),
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return request<{ success: boolean; id: number; url: string; message: string }>('/admin/media/upload', {
      method: 'POST',
      body: formData,
    });
  },
  deleteMedia: (id: number, force: boolean = false) =>
    request<{ success: boolean; message: string }>(`/admin/media/${id}?force=${force}`, {
      method: 'DELETE',
    }),

  // Admin Categories
  getCategories: (type: 'equipment' | 'training' | 'news' | 'products') =>
    request<Category[]>(`/admin/categories/${type}`),
  createCategory: (type: 'equipment' | 'training' | 'news' | 'products', name: string) =>
    request<{ success: boolean; id: number; message: string }>(`/admin/categories/${type}`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  deleteCategory: (type: 'equipment' | 'training' | 'news' | 'products', id: number) =>
    request<{ success: boolean; message: string }>(`/admin/categories/${type}/${id}`, {
      method: 'DELETE',
    }),

  // Admin Social Links
  getAdminSocialLinks: () => request<SocialLink[]>('/admin/social-links'),
  createSocialLink: (data: Partial<SocialLink>) =>
    request<{ success: boolean; id: number; message: string }>('/admin/social-links', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSocialLink: (id: number, data: Partial<SocialLink>) =>
    request<{ success: boolean; message: string }>(`/admin/social-links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSocialLink: (id: number) =>
    request<{ success: boolean; message: string }>(`/admin/social-links/${id}`, {
      method: 'DELETE',
    }),

  // Admin Contact Messages
  getContactMessages: () => request<ContactMessage[]>('/admin/contact-messages'),
  toggleMessageRead: (id: number) =>
  request<{ success: boolean; is_read: number }>(`/admin/contact-messages/${id}/toggle-read`, {
    method: 'PATCH',
  }),
  deleteMessage: (id: number) =>
  request<{ success: boolean; message: string }>(`/admin/contact-messages/${id}`, {
    method: 'DELETE',
  }),

  // Member Registration & Login (Questionnaire)
  registerMember: (data: {
    full_name: string;
    phone: string;
    email?: string;
    password?: string;
    age?: number | string;
    is_subscribed: boolean | number;
    plan_name?: string;
    start_date?: string;
    end_date?: string;
    fitness_goal?: string;
  }) =>
    request<{ token: string; member: Member; notifications: MemberNotification[]; message: string }>('/member/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  loginMember: (credentials: { identifier: string; password?: string }) =>
    request<{ token: string; member: Member; notifications: MemberNotification[]; message: string }>('/member/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMemberMe: () =>
    request<{ member: Member; notifications: MemberNotification[] }>('/member/me'),

  updateMemberProfile: (data: { full_name: string; email?: string; age?: number; fitness_goal?: string }) =>
    request<{ success: boolean; member: Member; message: string }>('/member/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Admin Members Management
  getAdminMembers: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    return request<Member[]>(`/admin/members?${q.toString()}`);
  },
  getAdminMember: (id: number) => request<Member>(`/admin/members/${id}`),
  createAdminMember: (data: Partial<Member> & { password?: string }) =>
    request<{ success: boolean; id: number; message: string }>('/admin/members', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAdminMember: (id: number, data: Partial<Member> & { password?: string }) =>
    request<{ success: boolean; message: string }>(`/admin/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  renewAdminMember: (id: number, data: { plan_name?: string; duration_months?: number; custom_end_date?: string }) =>
    request<{ success: boolean; member: Member; message: string }>(`/admin/members/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteAdminMember: (id: number) =>
    request<{ success: boolean; message: string }>(`/admin/members/${id}`, {
      method: 'DELETE',
    }),

  // Trainer & Member Messaging & Plans
  getMemberMessages: () =>
    request<{
      messages: TrainerMessage[];
      unreadCount: number;
      can_chat: boolean;
      has_pending_request: boolean;
      official_trainers: Array<{ id: number; name: string; role: string }>;
    }>('/member/messages'),

  sendMemberMessage: (data: {
    content: string;
    trainer_name?: string;
    message_type?: 'chat' | 'plan_request' | 'workout_plan' | 'chat_request';
    title?: string;
    plan_details?: WorkoutPlanDetails;
  }) =>
    request<{ success: boolean; message: TrainerMessage; can_chat?: boolean }>('/member/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  sendMemberChatRequest: (data: {
    trainer_name: string;
    content?: string;
    fitness_goal?: string;
  }) =>
    request<{ success: boolean; message: TrainerMessage; info: string }>('/member/chat-request', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  confirmWorkoutPlan: (messageId: number) =>
    request<{ success: boolean; confirmationMessage: TrainerMessage }>(
      `/member/messages/${messageId}/confirm-plan`,
      { method: 'POST' }
    ),

  markMemberMessageRead: (id: number) =>
    request<{ success: boolean }>(`/member/messages/${id}/read`, {
      method: 'POST',
    }),

  getAdminMemberMessages: (memberId: number) =>
    request<{ member: Member; messages: TrainerMessage[] }>(`/admin/members/${memberId}/messages`),

  sendAdminMemberMessage: (
    memberId: number,
    data: {
      trainer_id?: number;
      trainer_name?: string;
      message_type?: 'chat' | 'workout_plan' | 'nutrition_plan';
      title?: string;
      content: string;
      plan_details?: WorkoutPlanDetails;
    }
  ) =>
    request<{ success: boolean; message: TrainerMessage }>(`/admin/members/${memberId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteAdminMemberMessage: (msgId: number) =>
    request<{ success: boolean; message: string }>(`/admin/members/messages/${msgId}`, {
      method: 'DELETE',
    }),
};

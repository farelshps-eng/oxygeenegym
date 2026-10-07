export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface SiteSettings {
  gym_name?: string;
  gym_name_ar?: string;
  tagline?: string;
  description?: string;
  address?: string;
  plus_code?: string;
  google_maps_url?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  hero_title?: string;
  hero_description?: string;
  hero_image?: string;
  about_title?: string;
  about_text?: string;
  stat_equipment?: string;
  stat_area?: string;
  stat_programs?: string;
  stat_coaches?: string;
  show_stats?: string;
  subscription_notice?: string;
  [key: string]: string | undefined;
}

export interface Equipment {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
  category_name?: string;
  manufacturer?: string;
  model?: string;
  target_muscles?: string;
  usage_level?: string;
  instructions?: string;
  display_order: number;
  is_featured: number;
  is_published: number;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  order_index?: number;
}

export interface Training {
  id: number;
  name: string;
  slug: string;
  description?: string;
  category_name?: string;
  difficulty?: string;
  image_url?: string;
  gallery_json?: string;
  is_published: number;
  display_order: number;
  created_at: string;
}

export interface Trainer {
  id: number;
  name: string;
  slug: string;
  photo_url?: string;
  specialty?: string;
  bio?: string;
  experience?: string;
  training_types_json?: string;
  gallery_json?: string;
  display_order: number;
  is_published: number;
  created_at: string;
}

export interface Membership {
  id: number;
  name: string;
  slug: string;
  price: number;
  currency: string;
  duration: string;
  features_json?: string;
  description?: string;
  trainer_id?: number;
  image_url?: string;
  is_featured: number;
  is_active: number;
  display_order: number;
  created_at: string;
}

export interface Facility {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
  category?: string;
  display_order: number;
  is_published: number;
  created_at: string;
}

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  cover_image?: string;
  content?: string;
  category_name?: string;
  author?: string;
  published_at: string;
  is_published: number;
  is_featured: number;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
  price: number;
  currency: string;
  category_name?: string;
  availability_status: string;
  external_info_url?: string;
  is_featured: number;
  is_published: number;
  display_order: number;
  created_at: string;
}

export interface MediaItem {
  id: number;
  filename: string;
  original_name?: string;
  url: string;
  mime_type?: string;
  size?: number;
  created_at: string;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  is_active: number;
  order_index: number;
}

export interface ContactMessage {
  id: number;
  name: string;
  phone: string;
  message: string;
  is_read: number;
  created_at: string;
}

export interface Member {
  id: number;
  full_name: string;
  email?: string;
  phone: string;
  age?: number;
  is_subscribed: number;
  plan_name?: string;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'expiring' | 'expired' | 'inactive';
  fitness_goal?: string;
  notes?: string;
  last_renewed_at?: string;
  created_at: string;
  days_left?: number;
}

export interface MemberNotification {
  id: string;
  type: 'expiring_soon' | 'expired' | 'renewed' | 'welcome' | 'inactive';
  title: string;
  message: string;
  date: string;
  urgent: boolean;
}

export interface WorkoutExercise {
  name: string;
  sets: string;
  reps: string;
  rest?: string;
  notes?: string;
}

export interface WorkoutDay {
  day: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutPlanDetails {
  focus?: string;
  duration_weeks?: number;
  days_per_week?: number;
  schedule?: WorkoutDay[];
  diet_tips?: string;
}

export interface TrainerMessage {
  id: number;
  member_id: number;
  trainer_id?: number | null;
  trainer_name: string;
  sender_type: 'trainer' | 'member';
  message_type: 'chat' | 'workout_plan' | 'nutrition_plan' | 'plan_request' | 'chat_request';
  title?: string;
  content: string;
  plan_details_json?: string;
  plan_details?: WorkoutPlanDetails | null;
  is_read: number;
  created_at: string;
}

export interface DashboardStats {
  counts: {
    equipment: number;
    training: number;
    trainers: number;
    memberships: number;
    facilities: number;
    news: number;
    products: number;
    media: number;
    unreadMessages: number;
    totalMembers: number;
    activeMembers: number;
    expiringMembers: number;
    expiredMembers: number;
  };
  recent: {
    equipment: any[];
    news: any[];
    messages: ContactMessage[];
    members?: Member[];
  };
}

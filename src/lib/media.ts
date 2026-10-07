/** Default static images under /public/images */
export const DEFAULT_IMAGES = {
  hero: '/images/hero.svg',
  equipment: '/images/equipment.svg',
  training: '/images/training.svg',
  trainers: '/images/trainers.svg',
  facilities: '/images/facilities.svg',
  products: '/images/products.svg',
} as const;

const LEGACY_PREFIX = '/src/assets/images/';

/** Normalize DB or legacy paths to a loadable public URL */
export function resolveImageUrl(url?: string | null, fallback: string = DEFAULT_IMAGES.hero): string {
  if (!url || !url.trim()) return fallback;
  let u = url.trim();
  if (u.startsWith(LEGACY_PREFIX)) {
    const name = u.slice(LEGACY_PREFIX.length);
    const base = name.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const map: Record<string, string> = {
      hero_oxygen_gym_1790856807220: DEFAULT_IMAGES.hero,
      equipment_power_racks_1790856826759: DEFAULT_IMAGES.equipment,
      training_boxing_area_1790856839534: DEFAULT_IMAGES.training,
      trainers_coaching_team_1791128151134: DEFAULT_IMAGES.trainers,
      facilities_luxury_gym_1790856853986: DEFAULT_IMAGES.facilities,
      products_nutrition_showcase_1790856864933: DEFAULT_IMAGES.products,
    };
    for (const [key, target] of Object.entries(map)) {
      if (base.includes(key)) return target;
    }
    return fallback;
  }
  return u;
}

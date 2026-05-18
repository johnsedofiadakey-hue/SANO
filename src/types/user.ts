export type Fitzpatrick = 1 | 2 | 3 | 4 | 5 | 6;

export type Gender = 'male' | 'female' | 'other';

export type SkinConcern =
  | 'hyperpigmentation'
  | 'dark_spots'
  | 'acne'
  | 'razor_bumps'
  | 'oily_skin'
  | 'uneven_tone'
  | 'eczema'
  | 'keloids'
  | 'dryness'
  | 'dark_circles';

export type SkinGoal =
  | 'brighter_skin'
  | 'clear_skin'
  | 'even_tone'
  | 'glass_skin'
  | 'healthy_glow';

export type SubscriptionTier = 'free' | 'glow' | 'pro';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  fitzpatrick: Fitzpatrick;
  skin_concerns: SkinConcern[];
  skin_goal: SkinGoal;
  region: string;
  age_group: string;
  subscription: SubscriptionTier;
  research_opt_in: boolean;
  created_at: string;
}

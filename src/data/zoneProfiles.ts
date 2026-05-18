export type BodyZone =
  | 'face' | 'neck' | 'chest' | 'arms' | 'belly' | 'legs' | 'scalp'
  | 'beard' | 'back';

export interface ZoneProfile {
  label: string;
  description: string;
  likelyConditions: string[];
  unlikelyConditions: string[];
  aiContext: string;
  genders: ('male' | 'female' | 'other')[];
}

export const ZONE_PROFILES: Record<BodyZone, ZoneProfile> = {
  face: {
    label: 'Face',
    description: 'Cheeks, forehead, chin, nose',
    likelyConditions: ['acne', 'hyperpigmentation', 'dark spots', 'melasma', 'eczema', 'rosacea', 'seborrheic dermatitis'],
    unlikelyConditions: [],
    aiContext: 'The face is the most common area for acne, hyperpigmentation, melasma, and dark spots. On Fitzpatrick IV–VI skin, post-inflammatory hyperpigmentation (PIH) is the primary concern after any inflammation.',
    genders: ['male', 'female', 'other'],
  },
  beard: {
    label: 'Beard / Jaw',
    description: 'Chin, jaw, and shaving area',
    likelyConditions: ['razor bumps', 'pseudofolliculitis barbae', 'folliculitis', 'ingrown hairs', 'hyperpigmentation'],
    unlikelyConditions: ['typical cystic acne', 'melasma', 'eczema'],
    aiContext: 'This is a beard and shaving zone. Razor bumps (pseudofolliculitis barbae) are extremely common in men of African descent — curly hair curls back into the skin after shaving. The primary concerns are ingrown hairs, folliculitis, and the resulting PIH. Do NOT diagnose this as acne vulgaris.',
    genders: ['male'],
  },
  scalp: {
    label: 'Scalp',
    description: 'Scalp and hairline',
    likelyConditions: ['dandruff', 'seborrheic dermatitis', 'folliculitis', 'scalp psoriasis'],
    unlikelyConditions: ['acne vulgaris', 'melasma', 'hyperpigmentation'],
    aiContext: 'The scalp zone. Primary conditions are dandruff, seborrheic dermatitis, and folliculitis. Scalp acne is possible but less common than face acne.',
    genders: ['male', 'female', 'other'],
  },
  neck: {
    label: 'Neck',
    description: 'Front and sides of neck',
    likelyConditions: ['hyperpigmentation', 'razor bumps', 'folliculitis', 'acanthosis nigricans', 'eczema'],
    unlikelyConditions: ['melasma'],
    aiContext: 'The neck area. Dark neck (acanthosis nigricans) is common. Razor bumps extend from the beard area. Hyperpigmentation from friction is frequent.',
    genders: ['male', 'female', 'other'],
  },
  chest: {
    label: 'Chest',
    description: 'Chest and décolletage',
    likelyConditions: ['acne', 'hyperpigmentation', 'keloids', 'folliculitis', 'tinea versicolor'],
    unlikelyConditions: ['melasma', 'razor bumps'],
    aiContext: 'The chest and décolletage area. Chest acne and keloidal scarring are common on dark skin. Tinea versicolor (fungal) appears as light/dark patches. Keloids form more easily on the chest in Fitzpatrick IV–VI skin.',
    genders: ['male', 'female', 'other'],
  },
  back: {
    label: 'Back',
    description: 'Upper and lower back',
    likelyConditions: ['acne', 'folliculitis', 'keloids', 'hyperpigmentation', 'tinea versicolor'],
    unlikelyConditions: ['melasma', 'razor bumps'],
    aiContext: 'The back zone. Back acne (bacne) is very common, especially in males. Folliculitis and keloidal scarring are frequent. This is one of the most common acne sites on the body.',
    genders: ['male', 'female', 'other'],
  },
  arms: {
    label: 'Arms',
    description: 'Upper arms and forearms',
    likelyConditions: ['keratosis pilaris', 'eczema', 'hyperpigmentation', 'folliculitis'],
    unlikelyConditions: ['acne vulgaris', 'melasma'],
    aiContext: 'The arm zone. Keratosis pilaris (rough bumps, especially on upper arms) is extremely common. Eczema frequently appears in elbow creases. Do NOT diagnose arm bumps as acne — keratosis pilaris is far more likely.',
    genders: ['male', 'female', 'other'],
  },
  belly: {
    label: 'Belly',
    description: 'Abdomen and stomach',
    likelyConditions: ['stretch marks', 'hyperpigmentation', 'folliculitis', 'tinea versicolor'],
    unlikelyConditions: ['acne vulgaris', 'melasma', 'razor bumps'],
    aiContext: 'The belly/abdomen area. Stretch marks and hyperpigmentation from friction are common. Acne is uncommon on the belly — if bumps appear here, consider folliculitis or tinea versicolor.',
    genders: ['male', 'female', 'other'],
  },
  legs: {
    label: 'Legs',
    description: 'Thighs and lower legs',
    likelyConditions: ['razor bumps', 'folliculitis', 'keratosis pilaris', 'hyperpigmentation', 'eczema'],
    unlikelyConditions: ['acne vulgaris', 'cystic acne', 'melasma'],
    aiContext: 'The leg zone. IMPORTANT: Acne vulgaris does NOT occur on the legs or thighs. Any bumps on the legs are most likely razor bumps (from shaving), folliculitis, keratosis pilaris, or eczema. Never diagnose leg bumps as acne.',
    genders: ['male', 'female', 'other'],
  },
};

export const getZonesForGender = (gender: 'male' | 'female' | 'other' | null): BodyZone[] => {
  const all = Object.keys(ZONE_PROFILES) as BodyZone[];
  if (!gender) return all.filter(z => z !== 'beard');
  return all.filter(z => ZONE_PROFILES[z].genders.includes(gender));
};

type SeverityLevel = 'warn' | 'bad';
type SkinType = 'oily' | 'dry' | 'sensitive' | 'combination' | 'normal';

interface ConflictRule {
  ingredients: string[];
  message: string;
  severity: SeverityLevel;
}

interface SkinTypeWarning {
  ingredient: string;
  message: string;
}

interface DarkSkinWarning {
  ingredient: string;
  threshold?: number;
  message: string;
}

const CONFLICTS: ConflictRule[] = [
  {
    ingredients: ['vitamin c', 'ascorbic acid', 'niacinamide'],
    message:
      'Vitamin C and niacinamide reduce each other when applied immediately back-to-back. Wait 10 minutes between them.',
    severity: 'warn',
  },
  {
    ingredients: ['retinol', 'aha', 'glycolic acid', 'lactic acid'],
    message:
      'Retinol and AHAs together cause irritation and over-exfoliation. Use retinol at night and AHAs in the morning, or on alternate days.',
    severity: 'bad',
  },
  {
    ingredients: ['retinol', 'benzoyl peroxide'],
    message:
      'Benzoyl peroxide oxidises and deactivates retinol. Use them on separate evenings.',
    severity: 'bad',
  },
  {
    ingredients: ['vitamin c', 'benzoyl peroxide'],
    message:
      'Benzoyl peroxide oxidises vitamin C, making it ineffective.',
    severity: 'bad',
  },
  {
    ingredients: ['aha', 'bha', 'salicylic acid', 'glycolic acid'],
    message:
      'Combining multiple acids increases irritation risk without increasing effectiveness.',
    severity: 'warn',
  },
  {
    ingredients: ['retinol', 'vitamin c', 'ascorbic acid'],
    message:
      'Vitamin C (acidic pH) and retinol work best at different pH levels. Use Vitamin C in the AM and retinol in the PM for optimal results.',
    severity: 'warn',
  },
  {
    ingredients: ['spf', 'facial oil', 'argan oil', 'rosehip oil'],
    message:
      'Applying facial oils before SPF dilutes the sunscreen and reduces its protection factor.',
    severity: 'bad',
  },
];

const SKIN_TYPE_WARNINGS: Record<SkinType, string[]> = {
  oily:        ['shea butter', 'coconut oil', 'mineral oil', 'petrolatum', 'cocoa butter'],
  dry:         ['alcohol denat', 'sd alcohol', 'isopropyl alcohol', 'denatured alcohol'],
  sensitive:   ['fragrance', 'parfum', 'essential oils', 'menthol', 'camphor', 'eucalyptus'],
  combination: ['heavy mineral oil', 'petrolatum'],
  normal:      [],
};

const DARK_SKIN_WARNINGS: DarkSkinWarning[] = [
  {
    ingredient: 'hydroquinone',
    threshold: 2,
    message:
      'Hydroquinone above 2% can cause paradoxical darkening (ochronosis) on darker skin tones with prolonged use. Use with caution and take breaks.',
  },
  {
    ingredient: 'kojic acid',
    message:
      'Kojic acid can cause contact dermatitis in higher concentrations. Start with ≤1% formulations.',
  },
  {
    ingredient: 'alpha arbutin',
    message:
      'Alpha arbutin is a safer alternative to hydroquinone for hyperpigmentation in Fitzpatrick 4–6.',
  },
];

export interface ConflictResult {
  title: string;
  detail: string;
  severity: SeverityLevel;
  involvedProducts: string[];
}

export interface RoutineAnalysis {
  conflicts: ConflictResult[];
  warnings: string[];
  score: number;         // 0–100
  recommendation: string;
}

interface RoutineStep {
  name: string;
  ingredients?: string[];
}

interface SkinProfile {
  skinType?: SkinType;
  fitzpatrick?: number;
}

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 %]/g, '');
}

function containsIngredient(productName: string, ingredient: string): boolean {
  return normalise(productName).includes(normalise(ingredient));
}

function findMatchingIngredients(steps: RoutineStep[], ingredients: string[]): string[] {
  return steps
    .filter(step =>
      ingredients.some(ing => containsIngredient(step.name, ing))
    )
    .map(s => s.name);
}

export function analyzeRoutine(
  steps: RoutineStep[],
  skinProfile: SkinProfile = {}
): RoutineAnalysis {
  const conflicts: ConflictResult[] = [];
  const warnings: string[] = [];

  // Check ingredient conflicts
  for (const rule of CONFLICTS) {
    const matchingProducts = findMatchingIngredients(steps, rule.ingredients);
    if (matchingProducts.length >= 2) {
      const matchedIngredients = rule.ingredients.filter(ing =>
        steps.some(step => containsIngredient(step.name, ing))
      );
      conflicts.push({
        title: `${matchedIngredients.slice(0, 2).join(' + ').replace(/\b\w/g, c => c.toUpperCase())} conflict`,
        detail: rule.message,
        severity: rule.severity,
        involvedProducts: matchingProducts,
      });
    }
  }

  // Skin type warnings
  if (skinProfile.skinType && skinProfile.skinType in SKIN_TYPE_WARNINGS) {
    const problematic = SKIN_TYPE_WARNINGS[skinProfile.skinType];
    for (const step of steps) {
      for (const ing of problematic) {
        if (containsIngredient(step.name, ing)) {
          warnings.push(
            `"${step.name}" contains ${ing} — not ideal for ${skinProfile.skinType} skin.`
          );
        }
      }
    }
  }

  // Dark skin warnings for Fitzpatrick 4–6
  if (skinProfile.fitzpatrick !== undefined && skinProfile.fitzpatrick >= 4) {
    for (const step of steps) {
      for (const w of DARK_SKIN_WARNINGS) {
        if (containsIngredient(step.name, w.ingredient)) {
          warnings.push(`⚠️ ${w.message}`);
        }
      }
    }
  }

  // Score: start 100, deduct per conflict
  const badCount  = conflicts.filter(c => c.severity === 'bad').length;
  const warnCount = conflicts.filter(c => c.severity === 'warn').length;
  const score = Math.max(0, 100 - badCount * 20 - warnCount * 8 - warnings.length * 5);

  const recommendation =
    score >= 85 ? 'Your routine looks great! Minor tweaks will maximise results.' :
    score >= 70 ? 'Good base routine with a few conflicts to address.' :
    score >= 50 ? 'Several conflicts detected. Fixing these will significantly improve results.' :
    'Major conflicts found. Rebuild your routine using the corrected order.';

  return { conflicts, warnings, score, recommendation };
}

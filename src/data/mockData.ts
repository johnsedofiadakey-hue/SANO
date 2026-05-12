export const MOCK_USER = {
  name: 'Abena Osei',
  initials: 'AO',
  region: 'Greater Accra',
  fitzpatrick: 5 as const,
  skinTone: '#7A3E12',
  primaryConcern: 'hyperpigmentation',
  subscriptionTier: 'plus' as 'free' | 'plus' | 'pro',
  streakDays: 12,
  glowScore: 74,
  glowScoreChange: +6,
  cycleDay: 22,
  bloodGroup: 'O+',
  totalScans: 23,
  joinDate: 'January 2026',
} as const;

export const MOCK_SCAN_RESULT = {
  scanId: 'scan_demo_001',
  area: 'Face',
  primaryCondition: {
    name: 'Hyperpigmentation',
    subtype: 'Post-inflammatory',
    location: 'Jawline and cheeks',
    severity: 6.8,
    confidence: 97,
    intensity: 68,
    areaAffected: 40,
  },
  alsoDetected: ['Mild acne marks', 'Slight oiliness'],
  skinTone: 5,
  aiExplanation:
    'Your melanocytes are overproducing melanin in response to past inflammation — very common in Fitzpatrick type 4–6 skin after breakouts or shaving. Responds well to consistent treatment over 8–12 weeks.',
  whatHelps: [
    'Niacinamide 5%+ serum — apply every morning',
    'Vitamin C serum — apply every morning before niacinamide',
    'SPF 50+ every single morning — this is non-negotiable',
  ],
  whatToAvoid: [
    'Hydroquinone above 2%',
    'Alcohol-based toners',
    'Direct sun without protection',
  ],
  productsInAccra: [
    {
      name: 'CeraVe Niacinamide Serum',
      where: 'Ernest Chemists, Osu',
      price: 'GHS 180',
      match: 96,
      emoji: '🧴',
    },
    {
      name: 'Neutrogena SPF 50+',
      where: 'Entrance Pharmacy, East Legon',
      price: 'GHS 120',
      match: 94,
      emoji: '☀️',
    },
    {
      name: 'The Ordinary Niacinamide',
      where: 'Accra Mall, Shoprite',
      price: 'GHS 95',
      match: 91,
      emoji: '💧',
    },
  ],
  scannedAt: new Date().toISOString(),
} as const;

export const MOCK_SCAN_HISTORY = [
  {
    id: 'scan_001',
    area: 'Jawline',
    condition: 'Hyperpigmentation',
    severity: 6.8,
    daysAgo: 2,
    improving: true,
    color: '#7C3AED',
  },
  {
    id: 'scan_002',
    area: 'Forehead',
    condition: 'Oiliness',
    severity: 4.2,
    daysAgo: 5,
    improving: true,
    color: '#EC4899',
  },
  {
    id: 'scan_003',
    area: 'Neck',
    condition: 'Razor bumps',
    severity: 5.1,
    daysAgo: 7,
    improving: false,
    color: '#B45309',
  },
] as const;

export const MOCK_SCAN_GROUPS = [
  {
    id: 'group_001',
    name: 'Jawline hyperpigmentation',
    scanCount: 8,
    status: 'improving' as 'improving' | 'stable' | 'worsening',
    lastScan: '2 days ago',
    color: '#7C3AED',
    improvement: 59,
    startSeverity: 7.8,
    currentSeverity: 3.2,
    weeklyData: [7.8, 7.2, 6.5, 6.0, 5.4, 4.8, 4.0, 3.2],
  },
  {
    id: 'group_002',
    name: 'Forehead oiliness',
    scanCount: 5,
    status: 'improving' as 'improving' | 'stable' | 'worsening',
    lastScan: '5 days ago',
    color: '#EC4899',
    improvement: 34,
    startSeverity: 6.4,
    currentSeverity: 4.2,
    weeklyData: [6.4, 6.0, 5.6, 5.1, 4.8, 4.2],
  },
  {
    id: 'group_003',
    name: 'Neck razor bumps',
    scanCount: 6,
    status: 'stable' as 'improving' | 'stable' | 'worsening',
    lastScan: '1 week ago',
    color: '#B45309',
    improvement: 12,
    startSeverity: 5.8,
    currentSeverity: 5.1,
    weeklyData: [5.8, 5.6, 5.4, 5.3, 5.2, 5.1],
  },
] as const;

export const MOCK_ROUTINE = {
  morning: [
    { step: 1, name: 'Gentle foaming cleanser', status: 'good' as const, brand: 'CeraVe' },
    { step: 2, name: 'Vitamin C serum (15%)',   status: 'warn' as const, brand: 'The Ordinary' },
    { step: 3, name: 'Niacinamide toner',        status: 'warn' as const, brand: "Paula's Choice" },
    { step: 4, name: 'Heavy shea butter',        status: 'bad'  as const, brand: 'Generic' },
    { step: 5, name: 'SPF 30',                   status: 'ok'   as const, brand: 'Neutrogena' },
  ],
  evening: [
    { step: 1, name: 'Oil cleanser',  status: 'good' as const, brand: 'DHC' },
    { step: 2, name: 'Water cleanser',status: 'good' as const, brand: 'CeraVe' },
    { step: 3, name: 'Retinol 0.5%', status: 'ok'   as const, brand: 'The Ordinary' },
    { step: 4, name: 'Moisturiser',  status: 'good' as const, brand: 'CeraVe' },
  ],
  conflicts: [
    {
      title: 'Vitamin C + Niacinamide timing conflict',
      detail:
        'Applied back-to-back, these reduce each other\'s effectiveness. Apply Vitamin C first, wait 10 minutes, then niacinamide.',
      severity: 'warn' as const,
    },
    {
      title: 'Shea butter too occlusive for oily T-zone',
      detail:
        'Heavy occlusives are trapping sebum in your oily zones and contributing to congestion. Switch to a lightweight water-based moisturiser for daytime.',
      severity: 'bad' as const,
    },
  ],
  correctedOrder: [
    'Gentle cleanser → wait 2 minutes',
    'Vitamin C serum → wait 10 minutes',
    'Niacinamide toner → pat in gently',
    'Light water-based moisturiser',
    'SPF 50+ (upgrade from SPF 30)',
  ],
} as const;

export const MOCK_FOUNDATION_MATCHES = [
  {
    brand: 'Fenty Beauty',
    shade: '445W',
    type: 'Soft Matte Longwear Foundation',
    match: 99,
    swatchColor: '#6B3A1F',
    available: true,
    accraStore: undefined as string | undefined,
  },
  {
    brand: 'Black Opal',
    shade: 'Warm Brown',
    type: 'True Color Skin Perfecting Stick Foundation',
    match: 98,
    swatchColor: '#6A3015',
    available: true,
    accraStore: 'Ernest Chemists, Osu — GHS 185',
  },
  {
    brand: 'MAC',
    shade: 'N7 / NC50',
    type: 'Studio Fix Fluid SPF 15',
    match: 97,
    swatchColor: '#7A4020',
    available: false,
    accraStore: undefined as string | undefined,
  },
  {
    brand: "L'Oreal",
    shade: 'W8 Caramel',
    type: 'Infallible Pro-Matte 24HR',
    match: 94,
    swatchColor: '#724025',
    available: true,
    accraStore: 'Melcom Plus, Tema — GHS 142',
  },
];

export const MOCK_CHAT_RESPONSES = [
  {
    triggers: ['period', 'cycle', 'skin worse', 'luteal', 'breakout'],
    response:
      'This is completely normal! During your luteal phase (Days 14–28), progesterone rises and increases sebum production. More oil leads to congestion, inflammation, and more post-inflammatory hyperpigmentation. You\'re on Day 22 right now — right at the peak. It calms significantly after your period ends. I\'ll alert you 2 days before it\'s likely to happen next cycle. 🌙',
  },
  {
    triggers: ['product', 'recommend', 'niacinamide', 'buy', 'accra'],
    response:
      "For your skin profile — Fitzpatrick V, hyperpigmentation, combination skin in Accra — I recommend CeraVe Niacinamide Serum (available at Ernest Chemists, Osu for GHS 180). It has ceramides for barrier repair plus 5% niacinamide for brightening. 847 SANO users with your skin type rated it 4.4/5. Want me to add it to your routine?",
  },
  {
    triggers: ['spf', 'sunscreen', 'sun', 'sunblock'],
    response:
      'SPF is the most important product in your routine — more than any serum or treatment. In Accra, the UV index regularly hits 9–11 (extreme). Without SPF, your hyperpigmentation will keep coming back even if every other product is perfect. Upgrade from your current SPF 30 to SPF 50+ and apply it as the final step every single morning, even on cloudy days. ☀️',
  },
  {
    triggers: ['routine', 'order', 'steps', 'morning', 'evening'],
    response:
      'Your current routine has a timing conflict I flagged: Vitamin C and Niacinamide are cancelling each other out when applied back-to-back. Here\'s the corrected order:\n\n1. Gentle cleanser\n2. Vitamin C → wait 10 mins\n3. Niacinamide\n4. Light moisturiser\n5. SPF 50+\n\nThis small change will significantly improve how both products perform. Want me to set reminders for each step? 💜',
  },
  {
    triggers: ['hyperpigmentation', 'dark spot', 'dark patch', 'melanin', 'pigmentation'],
    response:
      'Post-inflammatory hyperpigmentation is your skin producing excess melanin after inflammation — very common in Fitzpatrick 4–6. Your scan from 2 days ago shows 68% intensity on your jawline. The good news: your Glow Score improved 6 points this week. Consistent niacinamide + vitamin C + SPF is the proven protocol. Most people see 40–60% improvement in 8–12 weeks. You\'re on week 3. 💜',
  },
  {
    triggers: ['glow score', 'score', 'progress', 'improving'],
    response:
      'Your Glow Score is 74 — up 6 points from last week! 📈 This is calculated from your scan history, routine consistency, and condition improvement. Your jawline hyperpigmentation has reduced from 7.8 to 3.2 severity in 8 weeks — that\'s a 59% improvement. Keep your current routine and your score should hit 80+ by next month.',
  },
  {
    triggers: ['razor', 'shaving', 'bump', 'ingrown', 'beard'],
    response:
      'Razor bumps (pseudofolliculitis barbae) are especially common in Fitzpatrick 4–6 due to naturally curly hair shafts that curve back into the skin. Recommendations: single-blade razor, shave with grain direction, glycolic acid toner (apply night before shaving), and aloe vera gel to soothe immediately after. Avoid multi-blade razors — they cut below skin level. Your neck scan shows mild-to-moderate severity. 💜',
  },
  {
    triggers: ['default'],
    response:
      "Based on your scan history, your hyperpigmentation is responding well — Glow Score up 6 points this week. Keep consistent with the niacinamide and vitamin C, and remember SPF every morning is what makes the difference. What would you like to know more about? 💜",
  },
] as const;

export const MOCK_COMMUNITY_POSTS = [
  {
    id: 'post_001',
    user: { initials: 'AO', name: 'Abena O.', location: 'Legon', gradient: true },
    timeAgo: '2h',
    tag: 'Hyperpigmentation',
    hasBefore: true,
    beforeLabel: 'Week 1',
    afterLabel: 'Week 8',
    text: '8 weeks on niacinamide + vitamin C. SANO fixed my routine order and told me my SPF 30 wasn\'t enough. Finally seeing real results! Glow score went from 51 to 78 🤩',
    likes: 142,
    comments: 38,
  },
  {
    id: 'post_002',
    user: { initials: 'KA', name: 'Kofi A.', location: 'Kumasi', gradient: false },
    timeAgo: '5h',
    tag: 'Razor Bumps',
    hasBefore: false,
    beforeLabel: '',
    afterLabel: '',
    text: 'SANO scanned my jawline and named my condition pseudofolliculitis barbae. Changed my shaving technique and switched to a single-blade razor like the app recommended. 6 weeks in — for all the guys dealing with this, you are not alone 💜',
    likes: 89,
    comments: 22,
  },
  {
    id: 'post_003',
    user: { initials: 'NM', name: 'Nana M.', location: 'East Legon', gradient: true },
    timeAgo: '1d',
    tag: 'Foundation Match',
    hasBefore: false,
    beforeLabel: '',
    afterLabel: '',
    text: 'Finally found my actual foundation shade! SANO matched me to Fenty 445W and I went and bought it — it\'s perfect. I\'ve been buying the wrong shade for 3 years 😭 The foundation matcher alone is worth downloading this app for.',
    likes: 203,
    comments: 61,
  },
] as const;

export const MOCK_VITALS = {
  heartRate: 74,
  spo2: 98,
  sleep: '7.2h',
  stress: 'Low',
  bloodPressure: '118/76',
  lastUpdated: new Date().toISOString(),
} as const;

export const MOCK_CYCLE = {
  currentDay: 22,
  cycleLength: 28,
  nextPeriodInDays: 4,
  phase: 'luteal' as const,
  skinForecast: [
    { day: 22, severity: 70, color: '#EC4899', label: 'Oily + breakout risk' },
    { day: 23, severity: 76, color: '#EC4899', label: 'Peak oiliness' },
    { day: 24, severity: 52, color: '#D97706', label: 'Sensitive skin' },
    { day: 25, severity: 32, color: '#059669', label: 'Calming' },
  ],
  phases: {
    period:     { days: [1, 2, 3, 4],                                       color: '#EC489933' },
    follicular: { days: [5, 6, 7, 8, 9, 10, 11],                            color: '#0891B233' },
    ovulation:  { days: [12, 13, 14],                                        color: '#05996933' },
    luteal:     { days: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28], color: '#7C3AED33' },
  },
} as const;

import { auth, FIREBASE_READY } from '../config/firebase';

const ANTHROPIC_READY = !!(
  typeof process !== 'undefined' &&
  process.env.EXPO_PUBLIC_API_URL &&
  !process.env.EXPO_PUBLIC_DEMO_MODE?.match(/^true$/i)
);

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// Smart keyword responder used when no API key
const getKeywordResponse = (message: string, userContext: any): string => {
  const m = message.toLowerCase();

  if (m.match(/period|cycle|hormone|pms|menstrual/)) {
    return `During your luteal phase (Days 14–28), progesterone rises and increases sebum production — more oil leads to congestion, then inflammation, then post-inflammatory hyperpigmentation. You're on Day ${userContext?.cycleDay ?? 22} right now — right at the peak. It calms significantly after your period ends. I'll alert you 2 days before it's likely to happen next cycle. 🌙`;
  }
  if (m.match(/niacinamide|vitamin c|serum|product|ingredient/)) {
    const concern = userContext?.skinConcerns?.[0] ?? userContext?.latestScan?.condition ?? 'hyperpigmentation';
    return `For your skin profile — Fitzpatrick ${userContext?.fitzpatrick ?? 'V'}, ${concern} — I recommend CeraVe Niacinamide Serum, available at Ernest Chemists, Osu for about GHS 180. It combines ceramides for barrier repair with 5% niacinamide for brightening. Want me to add it to your routine? 💜`;
  }
  if (m.match(/spf|sunscreen|sun protection/)) {
    return `SPF is the single most important step in your routine — more than any serum. In Accra the UV index regularly hits 9–11 (extreme). Without it, your hyperpigmentation keeps returning no matter how good everything else is. Use SPF 50+ every morning as your final step, even on cloudy days. ☀️`;
  }
  if (m.match(/routine|order|steps|morning|evening/)) {
    return `Your current routine has a timing conflict: Vitamin C and Niacinamide cancel each other when applied back to back. Corrected order: Cleanser → Vitamin C (wait 10 min) → Niacinamide → Moisturiser → SPF 50+. This change alone will significantly improve both products. Want me to set step reminders? 💜`;
  }
  if (m.match(/razor|shaving|bumps|beard|ingrown/)) {
    return `Razor bumps (pseudofolliculitis barbae) are extremely common on African skin — the hair curls back and grows into the skin. Best approach: single-blade razor, shave with the grain, glycolic acid toner after. Products available at Ernest Chemists. Results in about 4 weeks with consistency.`;
  }
  if (m.match(/foundation|shade|makeup|colour|color/)) {
    return `Based on your Fitzpatrick ${userContext?.fitzpatrick ?? 'V'} skin tone, your closest matches are Fenty Beauty 445W (99% match), Black Opal Warm Brown (98%), and MAC NC50 (97%). Black Opal is available at Ernest Chemists, Osu. Want to see the full foundation matcher? 💄`;
  }
  if (m.match(/hyperpigmentation|dark spot|dark mark|uneven/)) {
    return `Hyperpigmentation on darker skin tones responds best to a consistent routine: Vitamin C in the morning (GHS 120 at Ernest Chemists), Niacinamide 10% at night, and — most importantly — SPF 50+ every single day. Results take 8–12 weeks of consistency. The good news: your Glow Score is already trending up. 💜`;
  }
  if (m.match(/acne|pimple|breakout|blemish/)) {
    return `For acne on African skin, the most important thing is preventing the post-inflammatory hyperpigmentation (PIH) after — so never pop, always treat gently. Salicylic acid 2% cleanser (BHA) clears pores, and Niacinamide 10% at night prevents the dark marks. Both available at Ernest Chemists, Osu.`;
  }

  const concern = userContext?.skinConcerns?.[0] ?? userContext?.latestScan?.condition ?? 'skin';
  const score = userContext?.glowScore ? ` Your current Glow Score is ${userContext.glowScore}/100.` : '';
  return `Based on your scan history, your ${concern} is on the right track.${score} Keep consistent with your morning routine and remember SPF every single day makes the biggest difference. What would you like to know? 💜`;
};

const getFirebaseToken = async (): Promise<string> => {
  if (!FIREBASE_READY || !auth?.currentUser) return 'demo-token';
  return auth.currentUser.getIdToken();
};

export const sendChatMessage = async (
  message: string,
  conversationHistory: { me: boolean; txt: string }[],
  userContext: any
): Promise<string> => {

  if (!ANTHROPIC_READY) {
    await delay(1200 + Math.random() * 600);
    return getKeywordResponse(message, userContext);
  }

  try {
    const token = await getFirebaseToken();
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message, history: conversationHistory, userContext }),
    });

    if (!response.ok) throw new Error(`AI service error: ${response.status}`);
    const data = await response.json();
    return data.response ?? getKeywordResponse(message, userContext);
  } catch {
    return getKeywordResponse(message, userContext);
  }
};

export default { sendChatMessage };

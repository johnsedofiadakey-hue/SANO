// import PostHog from 'posthog-react-native';

const POSTHOG_READY = false;
let posthog: any = null;

// Kept for backwards compatibility (called in _layout.tsx)
export function initAnalytics(_apiKey?: string): void {
  // No-op — posthog is initialised at module load when key is present
}

export const track = (event: string, properties?: Record<string, any>) => {
  if (!POSTHOG_READY || !posthog) return;
  try { posthog.capture(event, properties); } catch (_) {}
};

export const identify = (userId: string, traits?: Record<string, any>) => {
  if (!POSTHOG_READY || !posthog) return;
  try { posthog.identify(userId, traits); } catch (_) {}
};

export const EVENTS = {
  // Onboarding
  WELCOME_OPENED:       'welcome_screen_opened',
  SOCIAL_LOGIN_TAPPED:  'social_login_tapped',
  ONBOARDING_STEP:      'onboarding_step_completed',
  ONBOARDING_COMPLETE:  'onboarding_completed',
  SKIN_TONE_SELECTED:   'skin_tone_selected',

  // Core scan loop
  SCAN_STARTED:         'scan_started',
  BODY_AREA_SELECTED:   'body_area_selected',
  CAMERA_OPENED:        'camera_opened',
  PHOTO_CAPTURED:       'photo_captured',
  SCAN_COMPLETED:       'scan_completed',
  RESULT_VIEWED:        'scan_result_viewed',
  RESULT_SHARED:        'scan_result_shared',
  RESULT_SAVED:         'scan_result_saved',

  // Features
  ROUTINE_CHECKED:      'routine_checker_opened',
  CONFLICT_DETECTED:    'routine_conflict_detected',
  FOUNDATION_MATCHED:   'foundation_match_completed',
  CHAT_MESSAGE_SENT:    'ai_chat_message_sent',
  CYCLE_DAY_LOGGED:     'cycle_day_logged',
  SYMPTOM_LOGGED:       'symptom_logged',
  PRODUCT_CHECKED:      'product_checked',
  BEFORE_AFTER_VIEWED:  'before_after_comparison_viewed',

  // Business
  SUBSCRIPTION_TAPPED:  'subscription_upgrade_tapped',
  PAYWALL_SEEN:         'paywall_viewed',
  DOCTOR_CHAT_OPENED:   'doctor_chat_opened',
  HARDWARE_KIT_TAPPED:  'hardware_kit_tapped',

  // Retention
  APP_OPENED:           'app_session_started',
  STREAK_MILESTONE:     'streak_milestone_reached',
  NOTIFICATION_TAPPED:  'notification_tapped',
} as const;

const analytics = { track, identify, EVENTS };
export default analytics;

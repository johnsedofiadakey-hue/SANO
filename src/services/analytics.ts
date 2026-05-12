import PostHog from 'posthog-react-native';

let client: PostHog | null = null;

export function initAnalytics(apiKey: string): void {
  client = new PostHog(apiKey, {
    host: 'https://app.posthog.com',
    disabled: !apiKey || apiKey === 'your_key_here',
  });
}

export type AnalyticsEvent =
  | 'scan_completed'
  | 'result_viewed'
  | 'result_shared'
  | 'product_checked'
  | 'routine_checked'
  | 'cycle_day_logged'
  | 'symptom_logged'
  | 'feature_opened'
  | 'onboarding_step_completed'
  | 'app_session_started'
  | 'chat_message_sent'
  | 'foundation_scan_started'
  | 'foundation_matches_shown';

export function track(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean | null>
): void {
  client?.capture(event, properties ?? {});
}

export function identify(anonymousId: string): void {
  client?.identify(anonymousId);
}

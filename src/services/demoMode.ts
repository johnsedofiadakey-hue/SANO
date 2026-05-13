import {
  MOCK_USER,
  MOCK_SCAN_RESULT,
  MOCK_SCAN_HISTORY,
  MOCK_SCAN_GROUPS,
  MOCK_ROUTINE,
  MOCK_FOUNDATION_MATCHES,
  MOCK_VITALS,
  MOCK_CYCLE,
  MOCK_CHAT_RESPONSES,
} from '../data/mockData';
export { DEMO_MODE } from '../config/firebase';

function simulateDelay<T>(value: T, minMs = 600, maxMs = 1200): Promise<T> {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  return new Promise(resolve => setTimeout(() => resolve(value), delay));
}

// Mock scan upload — returns MOCK_SCAN_RESULT after realistic delay
export async function demoUploadScan(_imageUri: string, _area: string) {
  return simulateDelay({
    scan_id: MOCK_SCAN_RESULT.scanId,
    conditions: [
      {
        name: MOCK_SCAN_RESULT.primaryCondition.name,
        location: MOCK_SCAN_RESULT.primaryCondition.location,
        severity: MOCK_SCAN_RESULT.primaryCondition.severity / 10,
        confidence: MOCK_SCAN_RESULT.primaryCondition.confidence / 100,
        doctor_confirmed: false,
      },
      ...MOCK_SCAN_RESULT.alsoDetected.map(d => ({
        name: d,
        location: 'face',
        severity: 0.3,
        confidence: 0.72,
        doctor_confirmed: false,
      })),
    ],
    skin_tone: MOCK_SCAN_RESULT.skinTone,
    model_version: 'v0.1-demo',
    processing_time_ms: 847,
  });
}

export async function demoGetScanHistory() {
  return simulateDelay([...MOCK_SCAN_HISTORY]);
}

export async function demoGetScanGroups() {
  return simulateDelay([...MOCK_SCAN_GROUPS]);
}

export async function demoGetUser() {
  return simulateDelay({ ...MOCK_USER });
}

export async function demoGetVitals() {
  return simulateDelay({ ...MOCK_VITALS });
}

export async function demoGetCycle() {
  return simulateDelay({ ...MOCK_CYCLE });
}

export async function demoGetFoundationMatches() {
  return simulateDelay([...MOCK_FOUNDATION_MATCHES], 1500, 2500);
}

export async function demoGetRoutine() {
  return simulateDelay({ ...MOCK_ROUTINE });
}

export async function demoLogin(_email: string, _password: string) {
  return simulateDelay({
    token: 'demo_token_abena_osei_2026',
    user: { id: 'demo_user_001', name: MOCK_USER.name },
  });
}

export async function demoChatReply(message: string): Promise<string> {
  const lower = message.toLowerCase();
  let matched: string | undefined;
  for (const entry of MOCK_CHAT_RESPONSES) {
    if (entry.triggers[0] === 'default') continue;
    if ((entry.triggers as readonly string[]).some(t => lower.includes(t))) {
      matched = entry.response;
      break;
    }
  }
  if (!matched) {
    matched = MOCK_CHAT_RESPONSES.find(e => e.triggers[0] === 'default')?.response
      ?? "I'm here to help with your skincare journey. 💜";
  }
  return simulateDelay(matched, 1000, 1400);
}

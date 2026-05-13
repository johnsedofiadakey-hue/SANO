import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface ReportOptions {
  userName: string;
  glowScore: number;
  fitzpatrick: number | null;
  condition?: string;
  severity?: number;
  confidence?: number;
  bodyArea?: string;
  recommendations?: string[];
}

export const generateScanReport = async (opts: ReportOptions): Promise<void> => {
  const {
    userName,
    glowScore,
    fitzpatrick,
    condition = 'Healthy Skin',
    severity = 0,
    confidence = 0,
    bodyArea = 'Face',
    recommendations = ['Consistent routine', 'SPF 50+ daily', 'Hydration'],
  } = opts;

  const severityPct = Math.round(severity * 100);
  const severityFill = severityPct > 0 ? `width:${severityPct}%` : 'width:0%';
  const dateStr = new Date().toLocaleDateString('en-GH', { dateStyle: 'full' });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; padding: 40px; color: #1a1a1a; background: #fff; }
    .header { background: linear-gradient(135deg, #6D28D9, #E8398A); color: white; padding: 24px 28px; border-radius: 12px; margin-bottom: 28px; }
    .logo { font-size: 36px; font-weight: 900; letter-spacing: 6px; margin-bottom: 4px; }
    .tagline { font-size: 13px; opacity: 0.8; }
    .date { font-size: 11px; opacity: 0.65; margin-top: 6px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .card { background: #F5F3FF; border-radius: 10px; padding: 18px; border: 1px solid #EDE9FE; }
    .card-label { font-size: 10px; font-weight: 700; color: #6D28D9; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .card-value { font-size: 32px; font-weight: 900; color: #0D0520; }
    .card-sub { font-size: 12px; color: #8B7AAE; margin-top: 2px; }
    .condition-card { background: #F5F3FF; border-radius: 10px; padding: 20px; margin-bottom: 16px; border: 1px solid #EDE9FE; }
    .condition-name { font-size: 22px; font-weight: 800; color: #0D0520; margin-bottom: 8px; }
    .bar-track { background: #EDE9FE; height: 8px; border-radius: 4px; overflow: hidden; margin: 8px 0; }
    .bar-fill { background: linear-gradient(90deg, #6D28D9, #E8398A); height: 100%; border-radius: 4px; }
    .bar-label { font-size: 11px; color: #8B7AAE; }
    .rec-card { background: #F0FDF4; border-radius: 10px; padding: 20px; margin-bottom: 16px; border: 1px solid #A7F3D0; }
    .rec-title { font-size: 13px; font-weight: 700; color: #059669; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .rec-item { font-size: 13px; color: #1a1a1a; margin-bottom: 8px; padding-left: 16px; position: relative; line-height: 1.5; }
    .rec-item::before { content: "✓"; position: absolute; left: 0; color: #059669; font-weight: 700; }
    .disclaimer { background: #FFFBEB; border: 1px solid #FCD34D; padding: 14px 16px; border-radius: 8px; font-size: 11px; color: #92600A; margin-bottom: 16px; line-height: 1.6; }
    .footer { text-align: center; font-size: 10px; color: #BDB0D6; border-top: 1px solid #EDE9FE; padding-top: 16px; margin-top: 24px; line-height: 1.8; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">SANO</div>
    <div class="tagline">Your Skin Health Report · ${userName}</div>
    <div class="date">Generated ${dateStr}</div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-label">Glow Score</div>
      <div class="card-value">${glowScore}</div>
      <div class="card-sub">out of 100</div>
    </div>
    <div class="card">
      <div class="card-label">Fitzpatrick Type</div>
      <div class="card-value">${fitzpatrick ?? '—'}</div>
      <div class="card-sub">Optimised analysis</div>
    </div>
  </div>

  <div class="condition-card">
    <div class="card-label">Primary Finding · ${bodyArea}</div>
    <div class="condition-name">${condition}</div>
    <div class="bar-label">Severity: ${severityPct}%</div>
    <div class="bar-track">
      <div class="bar-fill" style="${severityFill}"></div>
    </div>
    <div class="bar-label">Confidence: ${Math.round(confidence * 100)}%</div>
  </div>

  <div class="rec-card">
    <div class="rec-title">Recommendations</div>
    ${recommendations.map(r => `<div class="rec-item">${r}</div>`).join('')}
  </div>

  <div class="disclaimer">
    ⚠ This report is for wellness and informational purposes only and does not constitute a medical diagnosis.
    Always consult a qualified dermatologist or healthcare professional for medical concerns.
  </div>

  <div class="footer">
    SANO Health Technology · getsano.com<br/>
    Powered by DermaAI-v1.0 · Fitzpatrick-calibrated for African skin tones<br/>
    Report ID: SANO-${Date.now()}
  </div>
</body>
</html>`;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share your SANO skin report',
      UTI: 'com.adobe.pdf',
    });
  }
};

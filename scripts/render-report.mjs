import fs from 'node:fs/promises';

const folder = new URL('../reports/lighthouse/', import.meta.url);
const report = JSON.parse(
  await fs.readFile(new URL('mobile.json', folder), 'utf8'),
);
const referencedGroups = new Set(
  Object.values(report.categories).flatMap((category) =>
    category.auditRefs.map((audit) => audit.group),
  ),
);
report.categoryGroups = Object.fromEntries(
  Object.entries(report.categoryGroups).filter(([key]) =>
    referencedGroups.has(key),
  ),
);
await fs.writeFile(
  new URL('mobile.json', folder),
  `${JSON.stringify(report, null, 2)}\n`,
);
const escape = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ],
  );
const scores = Object.values(report.categories)
  .map(
    (category) =>
      `<div class="score"><strong>${Math.round(category.score * 100)}</strong><span>${escape(category.title)}</span></div>`,
  )
  .join('');
const metrics = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
]
  .map((id) => {
    const audit = report.audits[id];
    return `<tr><th>${escape(audit.title)}</th><td>${escape(audit.displayValue)}</td><td>${escape(audit.numericValue)} ${escape(audit.numericUnit)}</td></tr>`;
  })
  .join('');
const categories = Object.values(report.categories)
  .map(
    (category) =>
      `<section><h2>${escape(category.title)}</h2><table><thead><tr><th>검사</th><th>결과</th><th>상세</th></tr></thead><tbody>${category.auditRefs
        .map((ref) => {
          const audit = report.audits[ref.id];
          return `<tr><th>${escape(audit.title)}</th><td>${audit.score === null ? escape(audit.scoreDisplayMode) : `${Math.round(audit.score * 100)} / 100`}</td><td>${escape(audit.displayValue || audit.explanation || '')}</td></tr>`;
        })
        .join('')}</tbody></table></section>`,
  )
  .join('');
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>여백 스튜디오 · Lighthouse 성능 보고서</title><style>body{font-family:system-ui,sans-serif;background:#f6f7f4;color:#283b34;max-width:1100px;margin:40px auto;padding:0 20px;line-height:1.6}h1{font-size:28px}h2{margin-top:38px;font-size:20px}.scores{display:flex;gap:18px;flex-wrap:wrap}.score{background:white;border:1px solid #dbe3d4;border-radius:8px;padding:22px;min-width:150px;display:flex;flex-direction:column}.score strong{font-size:38px;color:#274b40}table{border-collapse:collapse;width:100%;background:white;font-size:13px}th,td{padding:12px;border:1px solid #dbe3d4;text-align:left}th{font-weight:500}p{font-size:13px}a{color:#274b40}code{overflow-wrap:anywhere}.table-wrap{overflow:auto}@media(max-width:600px){.score{min-width:calc(50% - 10px);padding:15px}.scores{gap:10px}table{font-size:11px}th,td{padding:8px}}</style></head><body><h1>여백 스튜디오 · Lighthouse 보고서</h1><p>측정 시각: ${escape(report.fetchTime)} · Lighthouse ${escape(report.lighthouseVersion)}<br>대상: <code>${escape(report.finalDisplayedUrl)}</code><br>환경: ${escape(report.environment.hostUserAgent)}<br>기기: ${escape(report.configSettings.formFactor)} · 스로틀링: ${escape(report.configSettings.throttlingMethod)}</p><div class="scores">${scores}</div><h2>주요 성능 지표</h2><div class="table-wrap"><table><thead><tr><th>지표</th><th>표시값</th><th>측정 원값</th></tr></thead><tbody>${metrics}</tbody></table></div><p>이 HTML은 같은 폴더의 <a href="mobile.json">Lighthouse JSON</a>을 정적 표로 표시합니다. 감사별 수치와 점수는 JSON 측정값을 그대로 사용합니다. 실제 공개 호스팅 성능과 다를 수 있습니다.</p>${categories}</body></html>`;
await fs.writeFile(new URL('mobile.html', folder), html);
console.log('Lighthouse HTML and JSON ready');

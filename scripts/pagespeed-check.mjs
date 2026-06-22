const url = process.argv[2] ?? 'https://lendswift-loan-application.netlify.app';
const api = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
api.searchParams.set('url', url);
for (const cat of ['accessibility', 'performance', 'best-practices', 'seo']) {
  api.searchParams.append('category', cat);
}
api.searchParams.set('strategy', 'mobile');

const res = await fetch(api, { signal: AbortSignal.timeout(120_000) });
if (!res.ok) {
  console.error('PageSpeed API error:', res.status, await res.text());
  process.exit(1);
}

const data = await res.json();
const cats = data.lighthouseResult?.categories ?? {};
for (const [name, { score }] of Object.entries(cats)) {
  console.log(`${name}: ${Math.round((score ?? 0) * 100)}`);
}

const fs = require('node:fs');
const origin = 'https://catalogocavalheirro.vercel.app';
(async()=>{
 const sitemapResponse=await fetch(origin+'/sitemap.xml');
 if(!sitemapResponse.ok) throw Error('Sitemap status '+sitemapResponse.status);
 const xml=await sitemapResponse.text();
 const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
 if(!urls.length)throw Error('Empty sitemap');
 const results=[];
 for(const url of urls){
  const r=await fetch(url);const html=await r.text();
  const canonical=html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/)?.[1];
  const title=html.match(/<title>(.*?)<\/title>/)?.[1];
  const h1=(html.match(/<h1(?:\s|>)/g)||[]).length;
  const noindex=/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html);
  const images=[...html.matchAll(/<img\s[^>]*>/g)].map(m=>m[0]);
  results.push({path:new URL(url).pathname,status:r.status,h1,canonicalOK:canonical===url,title,noindex,missingAlt:images.filter(i=>!/\salt=/.test(i)).length});
 }
 const robots=await fetch(origin+'/robots.txt').then(r=>r.text());
 const http=await fetch(origin.replace('https:','http:')+'/varejo',{redirect:'manual'});
 const privatePage=await fetch(origin+'/fabrica',{redirect:'manual'});
 const privateBody=await privatePage.text();
 const exclusiveBlocked=privatePage.headers.get('location')?.includes('/acesso-exclusivo') || (privateBody.includes('__next-page-redirect') && privateBody.includes('url=/acesso-exclusivo'));
 const report={date:new Date().toISOString(),urls:urls.length,results,robots,https:{status:http.status,location:http.headers.get('location')},exclusiveGate:{status:privatePage.status,redirectToExclusive:exclusiveBlocked}};
 fs.writeFileSync('docs/seo-live-audit.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
 if(results.some(r=>r.status!==200||r.h1!==1||!r.canonicalOK||r.noindex||r.missingAlt))process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exitCode=1;});

// Match the existing Vercel trailingSlash:false routes without changing content.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {normalizeArticleIdentities}=require('./article-identities.cjs');
const root=process.argv[2]||'dist';
const config=require('../vercel.json');
assert.equal(config.trailingSlash,false,'Normalizer is only valid for slashless routes');
const site=require('../brand/site.json');
const routes=['consultation-preparation','library','ecosystem','editorial-standards'];
const origin='https://'+site.domain;
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
let count=0;
for(const file of files(root).filter(f=>/\.(html|xml)$/.test(f))){
 let s=fs.readFileSync(file,'utf8'),original=s;
 for(const route of routes){
  const absolute=origin+'/'+route;
  s=s.replace(new RegExp(absolute.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'/(?=[\"\'#<])','g'),absolute);
  s=s.replace(new RegExp('(href=["\'])/'+route+'/(?=["\'#])','g'),'$1/'+route);
 }
 if(file.endsWith('.html')){
  const tag=s.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i);
  const href=tag&&tag[0].match(/href=["']([^"']+)["']/i);
  if(href&&href[1].startsWith(origin+'/')) s=s.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,(block,content)=>{
   const data=JSON.parse(content);
   return normalizeArticleIdentities(data,href[1])?block.replace(content,JSON.stringify(data).replace(/</g,'\\u003c')):block;
  });
 }
 if(s!==original){fs.writeFileSync(file,s);count++;}
}
// Fail the build if any canonical or sitemap entry still targets a redirect.
for(const route of routes){
 const html=fs.readFileSync(path.join(root,route,'index.html'),'utf8');
 assert(html.includes('rel="canonical" href="'+origin+'/'+route+'"'),route+' canonical does not match its live route');
 const xml=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
 assert(xml.includes('<loc>'+origin+'/'+route+'</loc>'),route+' missing normalized sitemap entry');
 assert(!xml.includes('<loc>'+origin+'/'+route+'/</loc>'),route+' retains redirected sitemap entry');
}
console.log('Canonical route normalization: '+count+' files updated; four routes verified.');

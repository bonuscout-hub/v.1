console.log('Cash Cacher build: launch-v1');

let OFFERS=[], cat='All', mysteryMode='all', visible=24, dashFilter='all';
const PROG='cashCacherProgressV1', CLICKS='cashCacherClicksV1';
const getP=()=>JSON.parse(localStorage.getItem(PROG)||'{}');
const setP=p=>localStorage.setItem(PROG,JSON.stringify(p));
const money=n=>n==null?'—':'$'+Number(n).toLocaleString(undefined,{maximumFractionDigits:2});
const cashText=o=>o.cash_value==null?'Estimate pending':money(o.cash_value);

async function init(){
  OFFERS=await fetch('offers.json').then(r=>r.json());
  document.getElementById('heroCount').textContent=OFFERS.length+'+';
  buildFilters(); buildMysteryFilters(); renderOffers(); renderDash(); renderCommunityCounters();
  document.getElementById('search').oninput=()=>{visible=24;renderOffers()};
  document.getElementById('sort').onchange=()=>{visible=24;renderOffers()};
  document.getElementById('loadMore').onclick=()=>{visible+=24;renderOffers()};
  document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');dashFilter=t.dataset.tab;renderDash()});
}
function buildFilters(){
 const presentCats=[...new Set(OFFERS.map(o=>o.category).filter(Boolean))];
 const preferredOrder=['All','Credit Cards','Banking','Investing','Sports','Mystery Packs','Travel','Subscriptions','Shopping','Education','Apps','Food','Collectibles'];
 const ordered=['All'];
 preferredOrder.slice(1).forEach(c=>{if(presentCats.includes(c))ordered.push(c);});
 presentCats.filter(c=>!ordered.includes(c)).sort().forEach(c=>ordered.push(c));
 document.getElementById('filters').innerHTML=ordered.map(c=>`<button class="filter ${c==='All'?'active':''}" data-cat="${c}">${c}</button>`).join('');
 document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>setCat(btn.dataset.cat,btn)));
}
function setCat(c,el){cat=c;mysteryMode='all';visible=24;document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));el.classList.add('active');renderOffers()}

function buildMysteryFilters(){
 const host=document.getElementById('mysteryFilters'); if(!host)return;
 const modes=[['all','All mystery packs'],['free','Free / signup'],['protected','Buyback / protected'],['partner','Affiliate / creator'],['cashout','Cash-out'],['credit','Site credit']];
 host.innerHTML=modes.map(([k,l])=>`<button class="filter mystery-sub ${k==='all'?'active':''}" data-mode="${k}">${l}</button>`).join('');
 host.querySelectorAll('button').forEach(b=>b.onclick=()=>{mysteryMode=b.dataset.mode;host.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');cat='Mystery Packs';document.querySelectorAll('.filter[data-cat]').forEach(x=>x.classList.toggle('active',x.dataset.cat==='Mystery Packs'));visible=24;renderOffers();});
}
function mysteryMatch(o){
 if(mysteryMode==='all') return true;
 const t=((o.tags||[]).join(' ')+' '+(o.reward_display||'')+' '+(o.risk_protection||'')+' '+(o.affiliate_note||'')).toLowerCase();
 if(mysteryMode==='free') return /free|signup|welcome|debut|referral/.test(t);
 if(mysteryMode==='protected') return Boolean(o.risk_protection)||/buyback|sellback|protected|guarantee|fmv/.test(t);
 if(mysteryMode==='partner') return Boolean(o.affiliate_program_url)||/affiliate|ambassador|creator|partner/.test(t);
 if(mysteryMode==='cashout') return /cashout|cash-out|cash back|withdraw|usd|usdc/.test(t);
 if(mysteryMode==='credit') return /site-credit|site credit|gems|ticket|store credit/.test(t);
 return true;
}

function currentList(){
 const q=document.getElementById('search').value.toLowerCase().trim();
 let a=OFFERS.filter(o=>(cat==='All'||o.category===cat)&&(cat!=='Mystery Packs'||mysteryMatch(o))&&(`${o.brand} ${o.title} ${o.reward_display} ${o.category} ${(o.tags||[]).join(' ')}`.toLowerCase().includes(q)));
 const sort=document.getElementById('sort').value;
 if(sort==='score')a.sort((x,y)=>(y.cash_score||0)-(x.cash_score||0));
 if(sort==='value')a.sort((x,y)=>(y.reward_value||0)-(x.reward_value||0));
 if(sort==='lowspend')a.sort((x,y)=>(x.required_spend??999999)-(y.required_spend??999999));
 return a;
}
function renderOffers(){
 const a=currentList();
 document.getElementById('resultCount').textContent=`${a.length} matching offers`;
 document.getElementById('offerGrid').innerHTML=a.slice(0,visible).map(card).join('')||'<div class="empty">No offers match those filters.</div>';
 document.getElementById('loadMoreWrap').style.display=a.length>visible?'block':'none';
}
function card(o){
 const partner=o.affiliate_program_url||o.referral_program_url||o.affiliate_url;
 const brandDeal=o.category==='Mystery Packs'&&(o.contact_email||o.contact_url||partner);
 const protectedPack=Boolean(o.risk_protection);
 const paid=o.sponsored===true;
 const spend=o.required_spend==null?'See terms':money(o.required_spend);
 return `<article class="card">
 <div class="brandline"><span class="badge">${o.category}</span>${paid?'<span class="badge sponsored">Sponsored</span>':partner?'<span class="badge partner">Partner path</span>':''}${protectedPack?'<span class="badge protect">Protection terms</span>':''}${brandDeal?'<span class="badge dealready">Brand-deal path</span>':''}</div>
 <div><div class="muted">${o.brand}</div><h3>${o.title}</h3></div>
 <div class="offer-title">${o.reward_display}</div>
 <div class="value-pair"><div class="value-box"><span>Advertised value</span><strong>${o.reward_value==null?'Varies':money(o.reward_value)}</strong></div><div class="value-box scout"><span>Cash Value</span><strong>${cashText(o)}</strong></div></div>
 <div class="score">Cash Score ${Number(o.cash_score||0).toFixed(1)}/10</div><div class="score-note">${o.score_basis||''}</div>
 <div class="quick"><div><span>WHAT YOU GET</span><b>${o.reward_display}</b></div><div><span>WHAT YOU DO</span><b>${spend==='See terms'?'Check qualifying terms':'Qualify with '+spend}</b></div><div class="catch"><span>THE CATCH</span><b>${o.eligibility}</b></div></div><div class="desc">${o.description}</div>${o.risk_protection?`<div class="risk-note"><b>Protection note:</b> ${o.risk_protection}</div>`:''}
 <div class="meta"><div><b>Qualifying amount</b><br>${spend}</div><div><b>Timing</b><br>${o.time}</div><div><b>Reward type</b><br>${o.reward_type}</div><div><b>Eligibility</b><br>${o.eligibility}</div></div>
 <div class="verify">✓ ${o.verification_level} · Verified ${o.verified}</div>${o.category==='Mystery Packs'&&o.affiliate_note?`<div class="partner-note"><b>Partnership path:</b> ${o.affiliate_note}</div>`:''}
 <div class="actions"><a class="btn secondary small" target="_blank" rel="noopener" href="${o.official_url}">Official Terms</a><button class="btn secondary small" onclick="track('${o.id}','saved')">Save</button><button class="btn primary small" onclick="start('${o.id}')">Start Offer</button></div>
 </article>`;
}
function track(id,status){const p=getP();p[id]=status;setP(p);renderDash()}
function start(id){
 const o=OFFERS.find(x=>x.id===id); if(!o)return;
 track(id,'started');
 const clicks=JSON.parse(localStorage.getItem(CLICKS)||'[]');
 clicks.push({offer_id:id,at:new Date().toISOString(),monetized:Boolean(o.affiliate_url)});
 localStorage.setItem(CLICKS,JSON.stringify(clicks));
 window.open(o.affiliate_url||o.official_url,'_blank','noopener,noreferrer');
}
function complete(id){track(id,'completed');renderCommunityCounters()}
function removeTracked(id){const p=getP();delete p[id];setP(p);renderDash()}
function renderDash(){
 const p=getP();
 let items=OFFERS.filter(o=>p[o.id]);
 if(dashFilter!=='all')items=items.filter(o=>p[o.id]===dashFilter);
 const earned=OFFERS.filter(o=>p[o.id]==='completed').reduce((s,o)=>s+(o.cash_value||0),0);
 const pending=OFFERS.filter(o=>p[o.id]==='started').reduce((s,o)=>s+(o.cash_value||0),0);
 document.getElementById('earned').textContent=money(earned);
 document.getElementById('pending').textContent=money(pending);
 document.getElementById('trackedCount').textContent=OFFERS.filter(o=>p[o.id]).length;
 document.getElementById('dashboardBody').innerHTML=items.length?items.map(o=>`<div class="offer-row"><div><b>${o.brand}</b><div class="muted">${o.title}</div></div><div>${cashText(o)}<div class="muted">Cash Value</div></div><div><span class="status">${p[o.id]}</span></div><div>${p[o.id]==='started'?`<button class="btn primary small" onclick="complete('${o.id}')">Complete</button>`:''} <button class="btn secondary small" onclick="removeTracked('${o.id}')">Remove</button></div></div>`).join(''):'<div class="empty">Your Cache is empty. Save or start an offer above.</div>';
}

function renderCommunityCounters(){
  const visitor=document.getElementById('visitorCount');
  const completedEl=document.getElementById('completedCount');
  const earnedEl=document.getElementById('earnedCount');
  const statusEl=document.getElementById('counterStatus');
  if(!visitor||!completedEl||!earnedEl) return;

  const p=getP();
  const completed=OFFERS.filter(o=>p[o.id]==='completed');
  const total=completed.reduce((sum,o)=>sum+Number(o.cash_value||0),0);

  visitor.textContent='1';
  completedEl.textContent=completed.length.toLocaleString();
  earnedEl.textContent='$'+Math.round(total).toLocaleString();
  if(statusEl) statusEl.textContent='Preview mode · connect Supabase later for community-wide totals.';
}

window.addEventListener('DOMContentLoaded',init);

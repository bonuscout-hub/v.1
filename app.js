
let OFFERS=[], cat='All', visible=24, dashFilter='all';
const PROG='bonusScoutProgressV3', CLICKS='bonusScoutClicksV3';
const getP=()=>JSON.parse(localStorage.getItem(PROG)||'{}');
const setP=p=>localStorage.setItem(PROG,JSON.stringify(p));
const money=n=>n==null?'—':'$'+Number(n).toLocaleString(undefined,{maximumFractionDigits:2});
const scoutText=o=>o.scout_value==null?'Estimate pending':money(o.scout_value);

async function init(){
  OFFERS=await fetch('offers.json').then(r=>r.json());
  document.getElementById('heroCount').textContent=OFFERS.length+'+';
  buildFilters(); renderOffers(); renderDash(); renderCommunityCounters();
  document.getElementById('search').oninput=()=>{visible=24;renderOffers()};
  document.getElementById('sort').onchange=()=>{visible=24;renderOffers()};
  document.getElementById('loadMore').onclick=()=>{visible+=24;renderOffers()};
  document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');dashFilter=t.dataset.tab;renderDash()});
}
function buildFilters(){
 const cats=['All',...new Set(OFFERS.map(o=>o.category))];
 document.getElementById('filters').innerHTML=cats.map(c=>`<button class="filter ${c==='All'?'active':''}" onclick="setCat('${c}',this)">${c}</button>`).join('');
}
function setCat(c,el){cat=c;visible=24;document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));el.classList.add('active');renderOffers()}
function currentList(){
 const q=document.getElementById('search').value.toLowerCase().trim();
 let a=OFFERS.filter(o=>(cat==='All'||o.category===cat)&&(`${o.brand} ${o.title} ${o.reward_display} ${o.category} ${(o.tags||[]).join(' ')}`.toLowerCase().includes(q)));
 const sort=document.getElementById('sort').value;
 if(sort==='score')a.sort((x,y)=>(y.scout_score||0)-(x.scout_score||0));
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
 const spend=o.required_spend==null?'See terms':money(o.required_spend);
 return `<article class="card">
 <div class="brandline"><span class="badge">${o.category}</span>${partner?'<span class="badge partner">Monetization option</span>':''}</div>
 <div><div class="muted">${o.brand}</div><h3>${o.title}</h3></div>
 <div class="offer-title">${o.reward_display}</div>
 <div class="value-pair"><div class="value-box"><span>Advertised value</span><strong>${o.reward_value==null?'Varies':money(o.reward_value)}</strong></div><div class="value-box scout"><span>Scout Value</span><strong>${scoutText(o)}</strong></div></div>
 <div class="score">Scout Score ${o.scout_score}/100</div>
 <div class="desc">${o.description}</div>
 <div class="meta"><div><b>Qualifying amount</b><br>${spend}</div><div><b>Timing</b><br>${o.time}</div><div><b>Reward type</b><br>${o.reward_type}</div><div><b>Eligibility</b><br>${o.eligibility}</div></div>
 <div class="verify">✓ ${o.verification_level} · Verified ${o.verified}</div>
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
 const earned=OFFERS.filter(o=>p[o.id]==='completed').reduce((s,o)=>s+(o.scout_value||0),0);
 const pending=OFFERS.filter(o=>p[o.id]==='started').reduce((s,o)=>s+(o.scout_value||0),0);
 document.getElementById('earned').textContent=money(earned);
 document.getElementById('pending').textContent=money(pending);
 document.getElementById('trackedCount').textContent=OFFERS.filter(o=>p[o.id]).length;
 document.getElementById('dashboardBody').innerHTML=items.length?items.map(o=>`<div class="offer-row"><div><b>${o.brand}</b><div class="muted">${o.title}</div></div><div>${scoutText(o)}<div class="muted">Scout Value</div></div><div><span class="status">${p[o.id]}</span></div><div>${p[o.id]==='started'?`<button class="btn primary small" onclick="complete('${o.id}')">Complete</button>`:''} <button class="btn secondary small" onclick="removeTracked('${o.id}')">Remove</button></div></div>`).join(''):'<div class="empty">Your Stash is empty. Save or start an offer above.</div>';
}

function renderCommunityCounters(){
  const visitor=document.getElementById('visitorCount');
  const completedEl=document.getElementById('completedCount');
  const earnedEl=document.getElementById('earnedCount');
  const statusEl=document.getElementById('counterStatus');
  if(!visitor||!completedEl||!earnedEl) return;

  const p=getP();
  const completed=OFFERS.filter(o=>p[o.id]==='completed');
  const total=completed.reduce((sum,o)=>sum+Number(o.scout_value||0),0);

  visitor.textContent='1';
  completedEl.textContent=completed.length.toLocaleString();
  earnedEl.textContent='$'+Math.round(total).toLocaleString();
  if(statusEl) statusEl.textContent='Preview mode · connect Supabase later for community-wide totals.';
}

window.addEventListener('DOMContentLoaded',init);

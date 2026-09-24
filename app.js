
let OFFERS=[], cat='All', visible=24, dashFilter='all';
const PROG='bonusScoutProgressV3', CLICKS='bonusScoutClicksV3';
const getP=()=>JSON.parse(localStorage.getItem(PROG)||'{}');
const setP=p=>localStorage.setItem(PROG,JSON.stringify(p));
const money=n=>n==null?'—':'$'+Number(n).toLocaleString(undefined,{maximumFractionDigits:2});
const scoutText=o=>o.scout_value==null?'Estimate pending':money(o.scout_value);

async function init(){
  await initCommunityCounters();
  OFFERS=await fetch('offers.json').then(r=>r.json());
  document.getElementById('heroCount').textContent=OFFERS.length+'+';
  document.getElementById('categoryCount').textContent=new Set(OFFERS.map(o=>o.category)).size;
  document.getElementById('affCount').textContent=OFFERS.filter(o=>o.affiliate_program_url||o.referral_program_url||o.affiliate_url).length;
  buildFilters(); renderOffers(); renderDash();
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
function complete(id){
  const before=getP()[id];
  track(id,'completed');
  if(before!=='completed') recordCommunityCompletion(id);
}
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

let BS_SUPABASE=null;

function formatCounter(n, moneyMode=false){
  if(n===null || n===undefined || Number.isNaN(Number(n))) return '—';
  const num=Number(n);
  if(moneyMode){
    if(num>=1000000) return '$'+(num/1000000).toFixed(num>=10000000?0:1)+'M';
    if(num>=1000) return '$'+(num/1000).toFixed(num>=10000?0:1)+'K';
    return '$'+Math.round(num).toLocaleString();
  }
  if(num>=1000000) return (num/1000000).toFixed(num>=10000000?0:1)+'M';
  if(num>=1000) return (num/1000).toFixed(num>=10000?0:1)+'K';
  return Math.round(num).toLocaleString();
}

function getVisitorId(){
  const key='bonusScoutAnonymousVisitorId';
  let id=localStorage.getItem(key);
  if(!id){
    id=(crypto.randomUUID ? crypto.randomUUID() : 'v-'+Date.now()+'-'+Math.random().toString(36).slice(2));
    localStorage.setItem(key,id);
  }
  return id;
}

function setCounterStatus(msg){
  const el=document.getElementById('counterStatus');
  if(el) el.textContent=msg;
}

function renderLocalCounters(){
  const localVisitor=1;
  const p=getP();
  const completed=OFFERS.filter(o=>p[o.id]==='completed');
  const value=completed.reduce((s,o)=>s+(o.scout_value||0),0);
  document.getElementById('visitorCount').textContent=formatCounter(localVisitor);
  document.getElementById('completedCount').textContent=formatCounter(completed.length);
  document.getElementById('earnedCount').textContent=formatCounter(value,true);
  setCounterStatus('Preview mode · connect Supabase to show community-wide totals.');
}

async function initCommunityCounters(){
  try{
    const cfg=window.BONUS_SCOUT_CONFIG||{};
    if(!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || !window.supabase){
      setTimeout(renderLocalCounters,0);
      return;
    }
    BS_SUPABASE=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);

    const visitorId=getVisitorId();
    await BS_SUPABASE.from('bs_visitors').upsert(
      {visitor_id:visitorId,last_seen:new Date().toISOString()},
      {onConflict:'visitor_id'}
    );
    await refreshCommunityCounters();
  }catch(err){
    console.warn('Bonus Scout counters unavailable',err);
    setTimeout(renderLocalCounters,0);
  }
}

async function recordCommunityCompletion(id){
  if(!BS_SUPABASE){
    renderLocalCounters();
    return;
  }
  try{
    const o=OFFERS.find(x=>x.id===id);
    if(!o) return;
    const visitorId=getVisitorId();
    // Unique completion per browser + offer prevents repeated Complete clicks from inflating totals.
    await BS_SUPABASE.from('bs_completions').upsert(
      {
        visitor_id:visitorId,
        offer_id:id,
        scout_value:Number(o.scout_value||0),
        completed_at:new Date().toISOString()
      },
      {onConflict:'visitor_id,offer_id'}
    );
    await refreshCommunityCounters();
  }catch(err){
    console.warn('Could not record completion',err);
  }
}

async function refreshCommunityCounters(){
  if(!BS_SUPABASE) return;
  try{
    const [visitorsRes, completionsRes]=await Promise.all([
      BS_SUPABASE.from('bs_visitors').select('*',{count:'exact',head:true}),
      BS_SUPABASE.from('bs_completions').select('scout_value')
    ]);
    if(visitorsRes.error) throw visitorsRes.error;
    if(completionsRes.error) throw completionsRes.error;

    const completions=completionsRes.data||[];
    const totalValue=completions.reduce((sum,row)=>sum+Number(row.scout_value||0),0);

    document.getElementById('visitorCount').textContent=formatCounter(visitorsRes.count||0);
    document.getElementById('completedCount').textContent=formatCounter(completions.length);
    document.getElementById('earnedCount').textContent=formatCounter(totalValue,true);
    setCounterStatus('Community totals · updated automatically.');
  }catch(err){
    console.warn('Could not refresh counters',err);
    renderLocalCounters();
  }
}

window.addEventListener('DOMContentLoaded',init);

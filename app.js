
let OFFERS=[], category='All';
const K='bonusScoutLiveProgress';
const progress=()=>JSON.parse(localStorage.getItem(K)||'{}');
const save=p=>localStorage.setItem(K,JSON.stringify(p));
const money=n=>'$'+Number(n).toLocaleString(undefined,{minimumFractionDigits:Number(n)%1?2:0,maximumFractionDigits:2});
async function init(){OFFERS=await fetch('offers.json').then(r=>r.json());buildFilters();renderOffers();renderDashboard();document.getElementById('search').oninput=renderOffers}
function buildFilters(){const cats=['All',...new Set(OFFERS.map(o=>o.category))];document.getElementById('filters').innerHTML=cats.map(c=>`<button class="filter ${c==='All'?'active':''}" onclick="setCat('${c}',this)">${c}</button>`).join('')}
function setCat(c,el){category=c;document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));el.classList.add('active');renderOffers()}
function renderOffers(){const q=(document.getElementById('search')?.value||'').toLowerCase();const list=OFFERS.filter(o=>(category==='All'||o.category===category)&&(`${o.brand} ${o.title} ${o.category}`.toLowerCase().includes(q)));document.getElementById('offerGrid').innerHTML=list.map(o=>`
<article class="card">
<span class="badge">${o.category}</span><div><div class="muted">${o.brand}</div><h3>${o.title}</h3></div>
<div class="value-pair">
  <div class="value-box"><div class="label">Advertised value</div><div class="num">${money(o.reward_value)}${o.reward_value>=1000?' max':''}</div></div>
  <div class="value-box scout"><div class="label">Scout Value</div><div class="num">${money(o.scout_value)}</div></div>
</div>
<div class="scoreline"><span class="scorepill">Scout Score ${o.scout_score}/100</span><span class="muted">Estimated practical value</span></div>
<div class="description">${o.description}</div>
<div class="meta"><div><b>Qualifying amount</b><br>${money(o.required_spend)}</div><div><b>Time</b><br>${o.time}</div><div><b>Reward type</b><br>${o.reward_type}</div><div><b>Difficulty</b><br>${o.difficulty}</div></div>
<div class="terms"><b>Why Scout Value is lower:</b> ${o.scout_reason}</div>
<div class="verify">✓ Verified ${o.verified}<br>Expires: ${o.expires}</div><div class="terms">${o.notes}</div>
<div class="actions"><a class="btn secondary small" href="${o.url}" target="_blank" rel="noopener">Official Terms</a><button class="btn secondary small" onclick="track('${o.id}','saved')">Save</button><button class="btn primary small" onclick="track('${o.id}','started')">Start</button></div>
</article>`).join('')}
function track(id,s){const p=progress();p[id]=s;save(p);renderDashboard();location.hash='dashboard'}
function complete(id){track(id,'completed')}
function removeTracked(id){const p=progress();delete p[id];save(p);renderDashboard()}
function renderDashboard(filter='all'){const p=progress();let t=OFFERS.filter(o=>p[o.id]);if(filter!=='all')t=t.filter(o=>p[o.id]===filter);const e=OFFERS.filter(o=>p[o.id]==='completed').reduce((s,o)=>s+o.scout_value,0);const pend=OFFERS.filter(o=>p[o.id]==='started').reduce((s,o)=>s+o.scout_value,0);const avail=OFFERS.filter(o=>!p[o.id]).reduce((s,o)=>s+o.scout_value,0);document.getElementById('earned').textContent=money(e);document.getElementById('pending').textContent=money(pend);document.getElementById('available').textContent=money(avail);document.getElementById('dashboardBody').innerHTML=t.length?t.map(o=>`<div class="offer-row"><div><strong>${o.brand}</strong><div class="muted">${o.title}</div></div><div><b>${money(o.scout_value)}</b><div class="muted">Scout Value</div></div><div><span class="status">${p[o.id]}</span></div><div>${p[o.id]==='started'?`<button class="btn primary small" onclick="complete('${o.id}')">Complete</button>`:''} <button class="btn secondary small" onclick="removeTracked('${o.id}')">Remove</button></div></div>`).join(''):'<div class="empty">Your Stash is empty. Save or start an offer above.</div>'}
function dashFilter(f,el){document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));el.classList.add('active');renderDashboard(f)}
window.addEventListener('DOMContentLoaded',init);

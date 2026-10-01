// Cash Cacher — Supabase tracking + public aggregate stats
const SUPABASE_URL='https://rzerutmgurhcqlkjynci.supabase.co';
const SUPABASE_KEY='sb_publishable_re6BzoXy327qbubXtxkmUQ_Y66R49jV';
const cashCacherDB=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

function getCashCacherSessionId(){
  let id=localStorage.getItem('cc_session_id');
  if(!id){id=crypto.randomUUID();localStorage.setItem('cc_session_id',id)}
  return id;
}
function getCashCacherDeviceType(){
  const w=window.innerWidth; return w<768?'mobile':w<1024?'tablet':'desktop';
}
function getCashCacherTrafficData(){
  const p=new URLSearchParams(location.search);
  return {source:p.get('utm_source'),medium:p.get('utm_medium'),campaign:p.get('utm_campaign'),content:p.get('utm_content')};
}
async function trackSiteEvent(event_type,extra={}){
  try{
    const t=getCashCacherTrafficData();
    const {error}=await cashCacherDB.from('site_events').insert({
      event_type,
      offer_id:extra.offer_id||null,
      offer_name:extra.offer_name||null,
      category:extra.category||null,
      cash_value:Number(extra.cash_value||0),
      source:t.source,medium:t.medium,campaign:t.campaign,content:t.content,
      page_path:location.pathname,referrer:document.referrer||null,
      session_id:getCashCacherSessionId(),device_type:getCashCacherDeviceType()
    });
    if(error) console.warn('Cash Cacher event tracking:',error.message);
  }catch(e){console.warn('Cash Cacher event tracking failed:',e)}
}
async function trackOfferClick(offer){
  try{
    const t=getCashCacherTrafficData();
    const {error}=await cashCacherDB.from('offer_clicks').insert({
      offer_id:offer.id||null,offer_name:offer.name||'Unknown Offer',category:offer.category||null,
      source:t.source,medium:t.medium,campaign:t.campaign,content:t.content,
      page_path:location.pathname,referrer:document.referrer||null,
      session_id:getCashCacherSessionId(),device_type:getCashCacherDeviceType()
    });
    if(error) console.warn('Cash Cacher click tracking:',error.message);
  }catch(e){console.warn('Cash Cacher click tracking failed:',e)}
  trackSiteEvent('offer_start',{offer_id:offer.id,offer_name:offer.name,category:offer.category});
}
async function getPublicStats(){
  try{
    const {data,error}=await cashCacherDB.rpc('get_public_stats');
    if(error) throw error;
    return Array.isArray(data)?data[0]:data;
  }catch(e){console.warn('Cash Cacher live stats unavailable:',e.message||e);return null}
}
window.trackOfferClick=trackOfferClick;
window.trackSiteEvent=trackSiteEvent;
window.getPublicStats=getPublicStats;
window.addEventListener('DOMContentLoaded',()=>trackSiteEvent('page_view'));

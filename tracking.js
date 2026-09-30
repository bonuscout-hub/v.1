// ==========================================
// CASH CACHER — SUPABASE TRACKING
// ==========================================

const SUPABASE_URL =
  'https://rzerutmgurhcqlkjynci.supabase.co';

const SUPABASE_KEY =
  'sb_publishable_re6BzoXy327qbubXtxkmUQ_Y66R49jV';

const cashCacherDB = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ------------------------------------------
// Create / retrieve anonymous session ID
// ------------------------------------------

function getCashCacherSessionId() {
  let sessionId = localStorage.getItem('cc_session_id');

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('cc_session_id', sessionId);
  }

  return sessionId;
}

// ------------------------------------------
// Determine basic device type
// ------------------------------------------

function getCashCacherDeviceType() {
  const width = window.innerWidth;

  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';

  return 'desktop';
}

// ------------------------------------------
// Read UTM tracking parameters
// ------------------------------------------

function getCashCacherTrafficData() {
  const params = new URLSearchParams(window.location.search);

  return {
    source: params.get('utm_source'),
    medium: params.get('utm_medium'),
    campaign: params.get('utm_campaign'),
    content: params.get('utm_content')
  };
}

// ------------------------------------------
// Track an offer click
// ------------------------------------------

async function trackOfferClick(offer) {
  try {
    const traffic = getCashCacherTrafficData();

    const { error } = await cashCacherDB
      .from('offer_clicks')
      .insert({
        offer_id: offer.id || null,
        offer_name: offer.name || 'Unknown Offer',
        category: offer.category || null,

        source: traffic.source,
        medium: traffic.medium,
        campaign: traffic.campaign,
        content: traffic.content,

        page_path: window.location.pathname,
        referrer: document.referrer || null,

        session_id: getCashCacherSessionId(),
        device_type: getCashCacherDeviceType()
      });

    if (error) {
      console.error('Cash Cacher tracking error:', error);
    }
  } catch (error) {
    console.error('Cash Cacher tracking failed:', error);
  }
}

// Make tracking available to the main Cash Cacher app
window.trackOfferClick = trackOfferClick;

// electionAPI.js
// Service to fetch and process Bihar 2020 election data from Times of India
// ---------------------------------------------------------------------------

import { fetchWithCorsProxy, getProductionCorsAdvice } from './corsProxy';

const BIHAR_2020_API_URL = 'https://hte.timesofindia.com/electionfeed/br2020/web_elections_al_pr_pg_cns_cnt_2020.htm';

/**
 * Fetches Bihar 2020 election data from Times of India API
 * @returns {Promise<Object>} Raw election data
 */
export async function fetchBiharElectionData() {
  try {
    console.log('🔄 Fetching Bihar 2020 election data...');
    
    const response = await fetchWithCorsProxy(BIHAR_2020_API_URL);
    const data = await response.json();
    
    console.log('✅ Bihar election data fetched successfully');
    return data.Bihar || data; // Handle different response structures
    
  } catch (error) {
    console.error('❌ Failed to fetch Bihar election data:', error);
    
    // Log production advice for developers
    if (process.env.NODE_ENV === 'production') {
      const advice = getProductionCorsAdvice();
      console.warn('🚨 Production CORS Issue:', advice);
    }
    
    console.log('📋 Using fallback data based on Bihar 2020 results');
    return getFallbackBiharData();
  }
}

/**
 * Fallback data based on the provided sample from Times of India
 */
function getFallbackBiharData() {
  return {
    "pr_rslt": [
      {"pn":"RASHTRIYA JANATA DAL","an":"RJD","cc":"#008000","e_id":4,"lg":"69388852","ls":0,"p_id":1407,"src":"","tc":243,"pws":80,"pvs":19,"ws":75,"wsc":-5,"wst":"D","vs":0,"vsc":-19,"vst":"D","al_id":885},
      {"pn":"BHARATIYA JANATA PARTY","an":"BJP","cc":"#ff9650","e_id":4,"lg":"51774624","ls":0,"p_id":1391,"src":"","tc":243,"pws":53,"pvs":25,"ws":74,"wsc":21,"wst":"U","vs":0,"vsc":-25,"vst":"D","al_id":884},
      {"pn":"JANATA DAL (UNITED)","an":"JD(U)","cc":"#00AA5A","e_id":4,"lg":"78680215","ls":0,"p_id":1401,"src":"","tc":243,"pws":71,"pvs":17,"ws":43,"wsc":-28,"wst":"D","vs":0,"vsc":-17,"vst":"D","al_id":884},
      {"pn":"INDIAN NATIONAL CONGRESS","an":"INC","cc":"#4ba9f0","e_id":4,"lg":"51774625","src":"","tc":243,"pws":27,"pvs":7,"ws":19,"wsc":-8,"wst":"D","vs":0,"vsc":-7,"vst":"D","al_id":885},
      {"pn":"COMMUNIST PARTY OF INDIA (MARXIST-LENINIST) (LIBERATION)","an":"CPI(ML)(L)","cc":"#84898B","e_id":4,"lg":"45963157","ls":0,"p_id":1436,"src":"","tc":243,"pws":3,"pvs":2,"ws":12,"wsc":9,"wst":"U","vs":0,"vsc":-2,"vst":"D","al_id":885},
      {"pn":"ALL INDIA MAJLIS-E-ITTEHADUL MUSLIMEEN","an":"AIMIM","cc":"#84898B","e_id":4,"lg":"45963157","ls":0,"p_id":1485,"src":"","tc":243,"pws":0,"pvs":0,"ws":5,"wsc":5,"wst":"U","vs":0,"vsc":0,"vst":"U","al_id":883},
      {"pn":"HINDUSTANI AWAM MORCHA (SECULAR)","an":"HAM-S","cc":"#84898b","e_id":4,"lg":"45963157","ls":0,"p_id":1480,"src":"","tc":243,"pws":1,"pvs":2,"ws":4,"wsc":3,"wst":"U","vs":0,"vsc":-2,"vst":"D","al_id":884},
      {"pn":"VIKASSHEEL INSAAN PARTY","an":"VIP","cc":"#84898B","e_id":4,"lg":"45963157","ls":0,"p_id":1453,"src":"","tc":243,"pws":0,"pvs":0,"ws":4,"wsc":4,"wst":"U","vs":0,"vsc":0,"vst":"U","al_id":884},
      {"pn":"COMMUNIST PARTY OF INDIA","an":"CPI","cc":"#84898B","e_id":4,"lg":"45963157","ls":0,"p_id":1523,"src":"","tc":243,"pws":0,"pvs":0,"ws":2,"wsc":2,"wst":"U","vs":0,"vsc":0,"vst":"U","al_id":885},
      {"pn":"COMMUNIST PARTY OF INDIA (MARXIST)","an":"CPM","cc":"#84898B","e_id":4,"lg":"45963157","ls":0,"p_id":1509,"src":"","tc":243,"pws":0,"pvs":0,"ws":2,"wsc":2,"wst":"U","vs":0,"vsc":0,"vst":"U"},
      {"pn":"BAHUJAN SAMAJ PARTY","an":"BSP","cc":"#84898B","e_id":4,"lg":"45963157","ls":0,"p_id":1390,"src":"","tc":243,"pws":0,"pvs":0,"ws":1,"wsc":1,"wst":"U","vs":0,"vsc":0,"vst":"U","al_id":883},
      {"pn":"INDEPENDENT","an":"IND","cc":"#84898B","e_id":4,"lg":"45963157","ls":0,"p_id":1399,"src":"","tc":243,"pws":4,"pvs":10,"ws":1,"wsc":-3,"wst":"D","vs":0,"vsc":-10,"vst":"D","al_id":883},
      {"pn":"LOK JAN SHAKTI PARTY","an":"LJP","cc":"#1a64f5","e_id":4,"lg":"69376721","ls":0,"p_id":1400,"src":"","tc":243,"pws":2,"pvs":5,"ws":1,"wsc":-1,"wst":"D","vs":0,"vsc":-5,"vst":"D","al_id":883}
    ],
    "ttl_seat": 243,
    "ag_rslt": [[
      {"a_id":891,"pn":"RJD","an":"RJD","cc":"#008000","e_id":4,"lg":"69388852","src":"","pvs":19,"pws":80,"ls":0,"tc":243,"ws":75,"wsc":-5,"wst":"D","vs":0,"vsc":-19,"vst":"D"},
      {"a_id":887,"pn":"BJP","an":"BJP","cc":"#ff9650","e_id":4,"lg":"51774624","src":"","pvs":25,"pws":53,"ls":0,"tc":243,"ws":74,"wsc":21,"wst":"U","vs":0,"vsc":-25,"vst":"D"},
      {"a_id":888,"pn":"JD(U)","an":"JD(U)","cc":"#00AA5A","e_id":4,"lg":"78680215","src":"","pvs":17,"pws":71,"ls":0,"tc":243,"ws":43,"wsc":-28,"wst":"D","vs":0,"vsc":-17,"vst":"D"},
      {"a_id":889,"pn":"INC","an":"INC","cc":"#4ba9f0","e_id":4,"lg":"51774625","src":"","pvs":7,"pws":27,"ls":0,"tc":243,"ws":19,"wsc":-8,"wst":"D","vs":0,"vsc":-7,"vst":"D"},
      {"a_id":890,"pn":"LJP","an":"LJP","cc":"#1a64f5","e_id":4,"lg":"69376721","src":"","pvs":5,"pws":2,"ls":0,"tc":243,"ws":1,"wsc":-1,"wst":"D","vs":0,"vsc":-5,"vst":"D"},
      {"a_id":886,"pn":"OTH","an":"OTH","cc":"#84898B","e_id":4,"lg":"45963157","src":"","pvs":17,"pws":10,"ls":0,"tc":243,"ws":31,"wsc":21,"wst":"U","vs":0,"vsc":-17,"vst":"D"}
    ]],
    "pg_rslt": [[
      {"a_id":884,"pn":"NDA","an":"NDA","cc":"#ff9650","e_id":4,"lg":"51774624","src":"","pvs":44,"pws":125,"ls":0,"tc":243,"ws":125,"wsc":0,"wst":"U","vs":0,"vsc":-44,"vst":"D"},
      {"a_id":885,"pn":"MGB","an":"MGB","cc":"#4ba9f0","e_id":4,"lg":"51774625","src":"","pvs":28,"pws":110,"ls":0,"tc":243,"ws":110,"wsc":0,"wst":"U","vs":0,"vsc":-28,"vst":"D"},
      {"a_id":883,"pn":"OTH","an":"OTH","cc":"#84898B","e_id":4,"lg":"45963157","src":"","pvs":18,"pws":8,"ls":0,"tc":243,"ws":8,"wsc":0,"wst":"U","vs":0,"vsc":-18,"vst":"D"}
    ]]
  };
}

/**
 * Transforms Bihar 2020 data to match the current timeline structure
 * @param {Object} biharData - Raw Bihar election data
 * @returns {Object} Transformed data with alliances and timeline
 */
export function transformBiharData(biharData) {
  const { pr_rslt: partyResults, pg_rslt: allianceResults } = biharData;
  
  // Extract alliance data from pg_rslt (page results)
  const alliances = allianceResults[0].map(alliance => ({
    id: alliance.an, // Alliance abbreviation (NDA, MGB, OTH)
    name: alliance.pn, // Full alliance name
    color: alliance.cc, // Alliance color
    wins: alliance.ws, // Won seats
    leads: 0, // No leads in final results
    previousWins: alliance.pws || 0, // Previous wins
    totalSeats: alliance.tc // Total seats
  }));

  // Create party mapping for detailed information
  const parties = partyResults.reduce((acc, party) => {
    acc[party.an] = {
      name: party.pn,
      abbreviation: party.an,
      color: party.cc,
      wins: party.ws,
      leads: 0,
      previousWins: party.pws || 0,
      allianceId: getAllianceForParty(party.an)
    };
    return acc;
  }, {});

  // Generate timeline data (simulating counting progression)
  const timeline = generateTimelineFromResults(alliances);

  return {
    alliances,
    parties,
    timeline,
    totalSeats: biharData.ttl_seat || 243,
    electionYear: 2020,
    state: 'Bihar'
  };
}

/**
 * Maps parties to their respective alliances based on Bihar 2020 results
 */
function getAllianceForParty(partyAbbr) {
  const ndaParties = ['BJP', 'JD(U)', 'HAM-S', 'VIP'];
  const mgbParties = ['RJD', 'INC', 'CPI(ML)(L)', 'CPI', 'CPM'];
  
  if (ndaParties.includes(partyAbbr)) return 'NDA';
  if (mgbParties.includes(partyAbbr)) return 'MGB';
  return 'OTH';
}

/**
 * Generates timeline data simulating the counting process
 * @param {Array} finalAlliances - Final alliance results
 * @returns {Array} Timeline array with progressive results
 */
function generateTimelineFromResults(finalAlliances) {
  const timeline = [];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', 'FINAL'
  ];

  timeSlots.forEach((time, index) => {
    const progress = index / (timeSlots.length - 1); // 0 to 1
    
    const alliances = finalAlliances.map(alliance => {
      // Simulate progressive counting with some randomness
      const finalWins = alliance.wins;
      const currentWins = Math.floor(finalWins * progress);
      const remainingSeats = finalWins - currentWins;
      const currentLeads = index < timeSlots.length - 1 ? 
        Math.floor(remainingSeats * (0.7 + Math.random() * 0.3)) : 0;

      return {
        id: alliance.id,
        wins: currentWins,
        leads: currentLeads
      };
    });

    timeline.push({
      time,
      alliances
    });
  });

  return timeline;
}

/**
 * Gets constituency-wise results for detailed view
 * @param {Object} biharData - Raw Bihar election data
 * @returns {Array} Array of constituency results
 */
export function getConstituencyResults(biharData) {
  // This would need the constituency results from cns_rslt if available
  // For now, return empty array as constituency data wasn't in the provided sample
  return [];
}

/**
 * Main function to fetch and process Bihar election data
 * @returns {Promise<Object>} Processed election data ready for the app
 */
export async function getBiharElectionData() {
  try {
    const rawData = await fetchBiharElectionData();
    // const transformedData = transformBiharData(rawData);
    
    // console.log('Bihar 2020 Election Data loaded:', {
    //   alliances: transformedData.alliances.length,
    //   parties: Object.keys(transformedData.parties).length,
    //   timelinePoints: transformedData.timeline.length,
    //   totalSeats: transformedData.totalSeats
    // });
    
    return rawData;
  } catch (error) {
    console.error('Error processing Bihar election data:', error);
    throw error;
  }
}

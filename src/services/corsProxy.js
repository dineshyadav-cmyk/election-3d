// corsProxy.js
// CORS proxy solutions for accessing Times of India election API
// ---------------------------------------------------------------------------

/**
 * List of CORS proxy services to try in order
 * Note: For production, you should set up your own CORS proxy server
 */
const CORS_PROXIES = [
  // Public CORS proxies (use with caution in production)
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  // Add your own CORS proxy here for production
  // 'https://your-cors-proxy.herokuapp.com/',
];

/**
 * Attempts to fetch data through multiple CORS proxy services
 * @param {string} url - The original URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export async function fetchWithCorsProxy(url, options = {}) {
  const errors = [];
  
  // First, try direct fetch (might work in some environments)
  try {
    const response = await fetch(url, {
      ...options,
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        ...options.headers
      }
    });
    
    if (response.ok) {
      console.log('✅ Direct fetch successful');
      return response;
    }
  } catch (error) {
    errors.push({ method: 'direct', error: error.message });
    console.warn('❌ Direct fetch failed:', error.message);
  }

  // Try each CORS proxy in sequence
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = proxy + encodeURIComponent(url);
      console.log(`🔄 Trying CORS proxy: ${proxy}`);
      
      const response = await fetch(proxyUrl, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options.headers
        }
      });
      
      if (response.ok) {
        console.log(`✅ CORS proxy successful: ${proxy}`);
        return response;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      errors.push({ method: proxy, error: error.message });
      console.warn(`❌ CORS proxy failed (${proxy}):`, error.message);
    }
  }
  
  // If all methods fail, throw comprehensive error
  const errorMessage = `All CORS proxy attempts failed:\n${errors.map(e => `- ${e.method}: ${e.error}`).join('\n')}`;
  throw new Error(errorMessage);
}

/**
 * Development-only CORS bypass using a local proxy server
 * This requires running a local CORS proxy server
 */
export function setupDevCorsProxy() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode: CORS proxy available');
    return 'http://localhost:8080/proxy/';
  }
  return null;
}

/**
 * Production CORS solution recommendations
 */
export function getProductionCorsAdvice() {
  return {
    message: 'For production deployment, consider these CORS solutions:',
    solutions: [
      '1. Set up your own CORS proxy server (recommended)',
      '2. Use a serverless function (Netlify/Vercel) as a proxy',
      '3. Request CORS headers from the Times of India API team',
      '4. Cache the data server-side and serve from your own API'
    ],
    example: 'https://github.com/Rob--W/cors-anywhere for self-hosted proxy'
  };
}

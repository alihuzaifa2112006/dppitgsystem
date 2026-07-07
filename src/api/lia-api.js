import axios from 'axios';

// LIA (Law Into Action) API instance for fetching regulation data
const liaApi = axios.create({
  baseURL: import.meta.env.VITE_LIA_API_URL,
});

// Attach API key to every request
liaApi.interceptors.request.use(
  (config) => {
    const apiKey = import.meta.env.VITE_LIA_API_KEY;
    if (apiKey) {
      config.headers['x-api-key'] = apiKey;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Fetch regulations from LIA API
 * @param {Object} params - Query parameters
 * @param {string} params.types - Comma-separated regulation types (e.g., 'ESPR,PPWR,REACH')
 * @param {string} params.region - Region filter (e.g., 'Europe')
 * @param {string} [params.query] - Search query
 * @param {string} [params.country] - Country filter
 * @param {string} [params.industry] - Industry filter
 * @param {string} [params.status] - Status filter
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Results per page
 */
export const getRegulations = (params = {}) => {
  const defaultParams = {
    types: 'ESPR,PPWR,EPR,REACH,DPP',
    region: 'Europe',
  };
  return liaApi.get('/regulations', {
    params: { ...defaultParams, ...params },
  });
};

export default liaApi;

import axios from 'axios';

const backendUrl = 'https://masterkinder20240523125154.azurewebsites.net';

const pdfDataCache = new Map();
const schoolDetailsCache = new Map();
const nearbySchoolsCache = new Map();

const normalizeName = (name) => {
  let normalizedName = name
    .replace(/^(Förskola\s+|Förskolan\s+|Föräldrakooperativet\s+|Föräldrakooperativ\s+|Föräldrarkoperativet\s+|Föräldrarkoperativ\s+|Daghemmet\s+|Daghem\s+|Barnstugan\s+|Barnstugan\s+)/i, '')
    .replace(/(\s+Förskola|\s+Förskolan|\s+Föräldrakooperativet|\s+Föräldrakooperativ|\s+Föräldrarkoperativet|\s+Föräldrarkoperativ|\s+Daghemmet|\s+Daghem|\s+Barnstugan|\s+Barnstugan)$/i, '')
    .trim();
  
  normalizedName = normalizedName.replace(/[^\w\s\-åäöÅÄÖ]/gi, '').toLowerCase();
  normalizedName = normalizedName.replace(/\s+/g, ' ');
  normalizedName = normalizedName.replace(/\s*-\s*/g, '-');
  normalizedName = normalizedName.split(' ')[0];

  return normalizedName;
};

export const fetchPdfDataByName = async (name) => {
  try {
    const normalizedName = normalizeName(name.trim());
    if (pdfDataCache.has(normalizedName)) {
      return pdfDataCache.get(normalizedName);
    }
    const encodedName = encodeURIComponent(normalizedName);
    const url = `${backendUrl}/api/PdfData/name/${encodedName}`;
    const response = await axios.get(url);
    const data = response.data?.$values[0] || null;
    pdfDataCache.set(normalizedName, data);
    return data;
  } catch (error) {
    console.error(`Error fetching PdfData by name (${name}):`, error);
    return null;
  }
};

export const fetchMalibuByName = async (name) => {
  try {
    const encodedName = encodeURIComponent(name.trim());
    const url = `${backendUrl}/api/Malibu/name/${encodedName}`;
    console.log(`Fetching Malibu data with URL: ${url}`);
    const response = await axios.get(url);
    const data = response.data?.$values[0] || null;
    console.log(`Fetched Malibu data for ${name}:`, data);
    pdfDataCache.set(name.trim(), data);
    return data;
  } catch (error) {
    console.error(`Error fetching Malibu data by name (${name}):`, error.response?.data || error.message);
    return null;
  }
};

export const fetchSchoolDetailsByAddress = async (address) => {
  try {
    if (schoolDetailsCache.has(address)) {
      return schoolDetailsCache.get(address);
    }
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `${backendUrl}/api/Forskolan/address/${encodedAddress}`;
    const response = await axios.get(url);
    const data = response.data?.$values[0] || null;
    schoolDetailsCache.set(address, data);
    return data;
  } catch (error) {
    console.error('Error fetching school details by address:', error);
    return null;
  }
};

export const fetchNearbySchools = async (lat, lng, organisationsform, typAvService) => {
  try {
    const cacheKey = `${lat},${lng},${organisationsform},${typAvService}`;
    if (nearbySchoolsCache.has(cacheKey)) {
      return nearbySchoolsCache.get(cacheKey);
    }
    const url = `${backendUrl}/api/Forskolan/nearby/${lat}/${lng}?organisationsform=${organisationsform}&typAvService=${typAvService}`;
    const response = await axios.get(url);
    const data = response.data?.$values || [];
    nearbySchoolsCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching nearby schools:', error);
    return [];
  }
};

export const fetchSchoolById = async (id) => {
  try {
    const response = await axios.get(`${backendUrl}/api/Forskolan/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching school by ID:', error);
    return null;
  }
};

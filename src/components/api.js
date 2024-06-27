import axios from 'axios';

const backendUrl = 'https://masterkinder20240523125154.azurewebsites.net';

// Funktion för att normalisera förskolans namn
const normalizeName = (name) => {
  let normalizedName = name.replace(/^(Förskola\s+|Förskolan\s+)/i, '').trim();
  normalizedName = normalizedName.replace(/(\s+Förskola|\s+Förskolan)$/i, '').trim();
  return normalizedName;
};

// Funktion för att hämta PdfData baserat på förskolans namn
export const fetchPdfDataByName = async (name) => {
  try {
    const normalizedName = normalizeName(name.trim());
    const encodedName = encodeURIComponent(normalizedName);
    const url = `${backendUrl}/api/PdfData/name/${encodedName}`;
    const response = await axios.get(url);
    return response.data?.$values[0] || null;
  } catch (error) {
    console.error(`Error fetching PdfData by name (${name}):`, error);
    return null;
  }
};

// Funktion för att hämta förskoledata baserat på adress
export const fetchSchoolDetailsByAddress = async (address) => {
  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `${backendUrl}/api/Forskolan/address/${encodedAddress}`;
    const response = await axios.get(url);
    return response.data?.$values[0] || null;
  } catch (error) {
    console.error('Error fetching school details by address:', error);
    return null;
  }
};

// Funktion för att hämta närliggande förskolor baserat på latitud och longitud
export const fetchNearbySchools = async (lat, lng) => {
  try {
    const url = `${backendUrl}/api/Forskolan/nearby/${lat}/${lng}`;
    const response = await axios.get(url);
    return response.data?.$values || [];
  } catch (error) {
    console.error('Error fetching nearby schools:', error);
    return [];
  }
};

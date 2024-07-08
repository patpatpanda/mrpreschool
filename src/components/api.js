import axios from 'axios';

const backendUrl = 'https://masterkinder20240523125154.azurewebsites.net';

const normalizeName = (name) => {
  let normalizedName = name
    .replace(/^(Förskola\s+|Förskolan\s+|Föräldrakooperativet\s+|Föräldrakooperativ\s+|Föräldrarkoperativet\s+|Föräldrarkoperativ\s+|Daghemmet\s+|Daghem\s+|Barnstugan\s+|Barnstugan\s+)/i, '')
    .replace(/(\s+Förskola|\s+Förskolan|\s+Föräldrakooperativet|\s+Föräldrakooperativ|\s+Föräldrarkoperativet|\s+Föräldrarkoperativ|\s+Daghemmet|\s+Daghem|\s+Barnstugan|\s+Barnstugan)$/i, '')
    .trim();
  
  // Remove special characters except Swedish letters and hyphen
  normalizedName = normalizedName.replace(/[^\w\s\-åäöÅÄÖ]/gi, '').toLowerCase();

  // Replace multiple spaces with a single space
  normalizedName = normalizedName.replace(/\s+/g, ' ');

  // Replace hyphens surrounded by spaces with a single hyphen
  normalizedName = normalizedName.replace(/\s*-\s*/g, '-');

  // Extract only the first part of the name, assuming it's the main name before any address or additional description
  normalizedName = normalizedName.split(' ')[0];

  console.log(`Normalized name: ${normalizedName}`); // Log the normalized name

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
// Funktion för att hämta närliggande förskolor baserat på latitud och longitud
export const fetchNearbySchools = async (lat, lng, organisationsform, typAvService) => {
  try {
    const url = `${backendUrl}/api/Forskolan/nearby/${lat}/${lng}?organisationsform=${organisationsform}&typAvService=${typAvService}`;
    const response = await axios.get(url);
    return response.data?.$values || [];
  } catch (error) {
    console.error('Error fetching nearby schools:', error);
    return [];
  }
};



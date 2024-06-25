import axios from 'axios';

export const fetchSchoolDetailsByGoogleName = async (name) => {
  try {
    const cleanName = name.replace(/^Förskolan\s+/i, '');
    const url = `https://masterkinder20240523125154.azurewebsites.net/api/PdfData/name/${encodeURIComponent(cleanName)}`;
    console.log(`API request URL (name): ${url}`);
    const response = await axios.get(url);
    console.log('API response (name):', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching school details by name:', error);
    return null;
  }
};

export const fetchSchoolDetailsByAddress = async (address) => {
  try {
    const addressParts = address.split(',');
    const relevantAddress = addressParts[0].trim();
    const url = `https://masterkinder20240523125154.azurewebsites.net/api/Forskolan/address/${encodeURIComponent(relevantAddress)}`;
    console.log(`API request URL (address): ${url}`);
    const response = await axios.get(url);
    console.log('API response (address):', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching school details by address:', error);
    return null;
  }
};

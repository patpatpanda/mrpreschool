import axios from 'axios';

export const fetchSchoolDetailsByGoogleName = async (name) => {
  try {
    const encodedName = encodeURIComponent(name.trim());
    console.log(`Encoded name for API request: ${encodedName}`);
    const url = `https://masterkinder20240523125154.azurewebsites.net/api/PdfData/name/${encodedName}`;
    console.log(`API request URL (name): ${url}`);
    const response = await axios.get(url);
    console.log('API response (name):', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching school details by name (${name}):`, error);
    return null;
  }
};

export const fetchSchoolDetailsByAddress = async (address) => {
  try {
    const encodedAddress = encodeURIComponent(address.trim());
    console.log(`Encoded address for API request: ${encodedAddress}`);
    const url = `https://masterkinder20240523125154.azurewebsites.net/api/Forskolan/address/${encodedAddress}`;
    console.log(`API request URL (address): ${url}`);
    const response = await axios.get(url);
    console.log('API response (address):', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching school details by address:', error);
    return null;
  }
};

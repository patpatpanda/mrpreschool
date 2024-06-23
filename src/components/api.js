import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'https://masterkinder20240523125154.azurewebsites.net/api';

export const fetchSchoolDetailsByGoogleName = async (placeAddress) => {
  try {
    const addressParts = placeAddress.split(',');
    const addressWithoutCity = addressParts[0].trim();
    const encodedAddress = encodeURIComponent(addressWithoutCity);
    const url = `${apiUrl}/schools/details/google/${encodedAddress}`;
    console.log(`Fetching details for ${encodedAddress} from ${url}`);
    const response = await axios.get(url);
    console.log(`Fetched details for ${encodedAddress}:`, response.data);
    return response.data;
  } catch (error) {
    console.error('There was an error fetching the school details!', error);
    return null;
  }
};

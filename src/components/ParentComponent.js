import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PreschoolCard from './PreschoolCard';

const ParentComponent = () => {
  const [schoolData, setSchoolData] = useState(null);
  const [googlePlaceName, setGooglePlaceName] = useState("Förskolan Kåxis"); // Exempelvärde, använd faktiskt värde
  const apiUrl = "https://masterkinder20240523125154.azurewebsites.net/api/schools/details/google";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/Kocksgatan 18`);
        setSchoolData(response.data);
        setGooglePlaceName("Kocksgatan 18"); // Set the actual place name here
      } catch (error) {
        console.error('There was an error fetching the school details!', error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div>
      {schoolData ? (
        <PreschoolCard googlePlaceName={googlePlaceName} schoolData={schoolData} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ParentComponent;

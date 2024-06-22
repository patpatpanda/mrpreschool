import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const SchoolDetails = ({ school }) => {
  const [schoolDetails, setSchoolDetails] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchoolDetails = async () => {
      try {
        const response = await axios.get(`https://masterkinder20240523125154.azurewebsites.net/api/schools/details/${school.schoolId}`);
        setSchoolDetails(response.data);
      } catch (err) {
        setError('Något gick fel. Försök igen.');
      }
    };

    fetchSchoolDetails();
  }, [school]);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h2>{schoolDetails.schoolName}</h2>
      <p><strong>Helhetsomdöme:</strong> {schoolDetails.helhetsomdome}%</p>
      <p><strong>Totalt antal svar:</strong> {schoolDetails.totalResponses}</p>
      <p><strong>Svarsfrekvens:</strong> {schoolDetails.svarsfrekvens}%</p>
      <p><strong>Antal barn på förskolan:</strong> {schoolDetails.antalBarn}</p>
    </div>
  );
};

SchoolDetails.propTypes = {
  school: PropTypes.shape({
    schoolId: PropTypes.number.isRequired,
  }).isRequired,
};

export default SchoolDetails;

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/PreschoolCard.css';
import { fetchSchoolDetailsByGoogleName } from './api'; // Import the function

const PreschoolCard = ({ preschool, onSelect, surveyResponses }) => {
  const [schoolData, setSchoolData] = useState(null);

  useEffect(() => {
    const fetchSchoolData = async () => {
      const data = await fetchSchoolDetailsByGoogleName(preschool.vicinity);
      setSchoolData(data);
    };

    fetchSchoolData();
  }, [preschool.vicinity]);

  console.log('Preschool data:', preschool);
  console.log('School data:', schoolData);

  return (
    <div className="preschool-card" onClick={() => onSelect(preschool)}>
      <h2>{preschool.name}</h2>
      <p>Address: {preschool.vicinity}</p>
      {schoolData ? (
        <>
          <p>Helhetsomdöme: {schoolData.helhetsomdome}%</p>
          <p>Antal svar: {schoolData.totalResponses}</p>
          <p>Svarsfrekvens: {schoolData.svarsfrekvens}%</p>
          <p>Antal barn på förskolan: {schoolData.antalBarn}</p>
        </>
      ) : (
        <p>Ingen data tillgänglig</p>
      )}
    </div>
  );
};

PreschoolCard.propTypes = {
  preschool: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  surveyResponses: PropTypes.object
};

export default PreschoolCard;

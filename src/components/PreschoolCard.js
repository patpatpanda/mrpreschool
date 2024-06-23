import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/PreschoolCard.css';
import { fetchSchoolDetailsByGoogleName } from './api';

const PreschoolCard = ({ preschool, onSelect }) => {
  const [schoolData, setSchoolData] = useState(null);

  useEffect(() => {
    const fetchSchoolData = async () => {
      const data = await fetchSchoolDetailsByGoogleName(preschool.vicinity);
      setSchoolData(data);
    };

    fetchSchoolData();
  }, [preschool.vicinity]);

  return (
    <div className="preschool-card" onClick={() => onSelect(schoolData)}>
      <h2>{preschool.name}</h2>
      {schoolData ? (
        <>
          <p>Adress: {schoolData.address}</p>
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
  onSelect: PropTypes.func.isRequired
};

export default PreschoolCard;

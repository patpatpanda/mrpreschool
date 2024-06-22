import React from 'react';
import PropTypes from 'prop-types';
import '../styles/PreschoolCard.css';
import { FaMapMarkerAlt } from 'react-icons/fa';

const PreschoolCard = ({ preschool, onSelect, surveyResponses }) => {
  const { name, vicinity } = preschool;
  const { totalResponses, helhetsomdome, svarsfrekvens, antalBarn } = surveyResponses || {};

  return (
    <div className="preschool-card" onClick={() => onSelect(preschool)}>
      <h2>{name || 'Namn saknas'}</h2>
      <div className="preschool-info">
        <div className="info-item">
          <FaMapMarkerAlt className="icon" />
          <p>{vicinity || 'Adress saknas'}</p>
        </div>
      </div>
      <div className="survey-results">
        {surveyResponses ? (
          <>
            <p><strong>Helhetsomdöme:</strong> {helhetsomdome?.toFixed(2) || 'N/A'}%</p>
            <p><strong>Totalt antal svar:</strong> {totalResponses || 'N/A'}</p>
            <p><strong>Svarsfrekvens:</strong> {svarsfrekvens?.toFixed(2) || 'N/A'}%</p>
            <p><strong>Antal barn på förskolan:</strong> {antalBarn || 'N/A'}</p>
          </>
        ) : (
          <p>Ingen data tillgänglig</p>
        )}
      </div>
    </div>
  );
};

PreschoolCard.propTypes = {
  preschool: PropTypes.shape({
    name: PropTypes.string,
    vicinity: PropTypes.string,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  surveyResponses: PropTypes.shape({
    totalResponses: PropTypes.number,
    helhetsomdome: PropTypes.number,
    svarsfrekvens: PropTypes.number,
    antalBarn: PropTypes.number,
  }),
};

export default PreschoolCard;

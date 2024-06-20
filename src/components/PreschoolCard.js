import React from 'react';
import PropTypes from 'prop-types';
import '../styles/PreschoolCard.css';
import { FaMapMarkerAlt } from 'react-icons/fa';

const PreschoolCard = ({ preschool, onSelect, surveyResponses }) => {
  if (!preschool) {
    return null;
  }

  const { name, vicinity } = preschool;
  const { responsePercentages, totalResponses } = surveyResponses || {};

  // Filtrera bort svar med 0%
  const filteredResponses = responsePercentages
    ? Object.entries(responsePercentages).filter(([response, percentage]) => percentage > 0)
    : [];

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
        <h3>Är du nöjd med din förskola?</h3>
        {totalResponses !== undefined && (
          <p>Totalt antal svar: {totalResponses}</p>
        )}
        {filteredResponses.length > 0 ? (
          <ul>
            {filteredResponses.map(([response, percentage]) => (
              <li key={response}>
                {response}: {percentage.toFixed(2)}%
              </li>
            ))}
          </ul>
        ) : (
          <p>Inga undersökningssvar tillgängliga</p>
        )}
      </div>
    </div>
  );
};

PreschoolCard.propTypes = {
  preschool: PropTypes.shape({
    name: PropTypes.string,
    vicinity: PropTypes.string,
  }),
  onSelect: PropTypes.func.isRequired,
  surveyResponses: PropTypes.object,
};

export default PreschoolCard;

import React from 'react';
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const PreschoolCard = ({ preschool, onSelect }) => (
  <div onClick={() => onSelect(preschool)} className="card">
    <div className="card-header">
      <h3>{preschool.namn}</h3>
    </div>
    <div className="card-body">
      <p><FontAwesomeIcon icon={faMapMarkerAlt} /> {preschool.adress}</p>
      {preschool.description && <p><FontAwesomeIcon icon={faInfoCircle} /> {preschool.description}</p>}
      {preschool.pdfData && (
        <div className="details">
          <p><span>Antal Svar:</span> {preschool.pdfData.antalSvar}st</p>
          <p><span>Helhetsomdome:</span> {preschool.pdfData.helhetsomdome}%</p>
          <p><span>Svarsfrekvens:</span> {preschool.pdfData.svarsfrekvens}%</p>
        </div>
      )}
    </div>
  </div>
);

PreschoolCard.propTypes = {
  preschool: PropTypes.shape({
    namn: PropTypes.string.isRequired,
    adress: PropTypes.string.isRequired,
    description: PropTypes.string,
    pdfData: PropTypes.object,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default PreschoolCard;

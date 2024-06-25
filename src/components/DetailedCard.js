import React from 'react';
import PropTypes from 'prop-types';

const DetailedCard = ({ schoolData, onClose }) => (
  <div className="detailed-card">
    <button onClick={onClose}>Close</button>
    <h2>{schoolData.name}</h2>
    <p>{schoolData.vicinity}</p>
    {schoolData.pdfData && schoolData.pdfData.$values && schoolData.pdfData.$values.length > 0 && (
      <div>
        <h3>Details:</h3>
        <p>{schoolData.pdfData.$values[0].namn}</p>
        <p>Helhetsomdome: {schoolData.pdfData.$values[0].helhetsomdome}</p>
        <p>Svarsfrekvens: {schoolData.pdfData.$values[0].svarsfrekvens}</p>
      </div>
    )}
    {schoolData.address && <p>Address: {schoolData.address}</p>}
    {schoolData.description && <p>Description: {schoolData.description}</p>}
  </div>
);

DetailedCard.propTypes = {
  schoolData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    vicinity: PropTypes.string.isRequired,
    pdfData: PropTypes.object,
    address: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DetailedCard;

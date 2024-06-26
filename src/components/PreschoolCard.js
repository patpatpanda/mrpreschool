import React from 'react';
import PropTypes from 'prop-types';

const PreschoolCard = ({ preschool, onSelect }) => (
  <div onClick={() => onSelect(preschool)} className="card">
    <h3>{preschool.name}</h3>
    <p>{preschool.vicinity}</p>
    {preschool.address && <p>Address: {preschool.address}</p>}
    {preschool.description && <p>Description: {preschool.description}</p>}
    {preschool.pdfData && preschool.pdfData.$values && preschool.pdfData.$values.length > 0 && (
      <div>
    
        <p>Antal Svar: {preschool.pdfData.$values[0].antalSvar}st</p>
        <p>Helhetsomdome: {preschool.pdfData.$values[0].helhetsomdome}%</p>
        <p>Svarsfrekvens: {preschool.pdfData.$values[0].svarsfrekvens}%</p>
      </div>
    )}
  </div>
);

PreschoolCard.propTypes = {
  preschool: PropTypes.shape({
    name: PropTypes.string.isRequired,
    vicinity: PropTypes.string.isRequired,
    address: PropTypes.string,
    description: PropTypes.string,
    pdfData: PropTypes.object,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default PreschoolCard;

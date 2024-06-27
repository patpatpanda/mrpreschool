import React from 'react';
import PropTypes from 'prop-types';

const PreschoolCard = ({ preschool, onSelect }) => (
  <div onClick={() => onSelect(preschool)} className="card">
    <h3>{preschool.namn}</h3>
    <p>{preschool.adress}</p>
    {preschool.description && <p>Description: {preschool.description}</p>}
    {preschool.pdfData && (
      <div>
        <p>Antal Svar: {preschool.pdfData.antalSvar}st</p>
        <p>Helhetsomdome: {preschool.pdfData.helhetsomdome}%</p>
        <p>Svarsfrekvens: {preschool.pdfData.svarsfrekvens}%</p>
      </div>
    )}
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
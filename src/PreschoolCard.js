import React from 'react';
import PropTypes from 'prop-types';
import './PreschoolCard.css';

const PreschoolCard = ({ preschool }) => {
  return (
    <div className="preschool-card">
      <h3>{preschool.name}</h3>
      <p>{preschool.vicinity}</p>
      <p>Betyg (1-5): {preschool.rating || 'No rating available'}</p>
      
    </div>
  );
};

PreschoolCard.propTypes = {
  preschool: PropTypes.shape({
    name: PropTypes.string.isRequired,
    vicinity: PropTypes.string.isRequired,
    rating: PropTypes.number,
    user_ratings_total: PropTypes.number,
  }).isRequired,
};

export default PreschoolCard;

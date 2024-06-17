import React from 'react';
import PropTypes from 'prop-types';
import '../styles/PreschoolCard.css';

const PreschoolCard = ({ preschool, onSelect }) => {
  const handleSelect = () => {
    onSelect(preschool);
  };

  return (
    <div className="preschool-card" onClick={handleSelect}>
      <h3>{preschool.name}</h3>
      <p>{preschool.vicinity}</p>
      {preschool.rating && <p>Rating: {preschool.rating}</p>}
      {/* {preschool.user_ratings_total && <p>User Ratings: {preschool.user_ratings_total}</p>} */}
    </div>
  );
};

PreschoolCard.propTypes = {
  preschool: PropTypes.shape({
    name: PropTypes.string.isRequired,
    place_id: PropTypes.string.isRequired,
    vicinity: PropTypes.string.isRequired,
    rating: PropTypes.number,
    user_ratings_total: PropTypes.number,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default PreschoolCard;
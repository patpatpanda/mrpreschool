import React from 'react';
import PropTypes from 'prop-types';
import '../styles/PreschoolCard.css';
import { FaMapMarkerAlt, FaStar, FaUsers } from 'react-icons/fa';

const PreschoolCard = ({ preschool, onSelect }) => {
  if (!preschool) {
    return null;
  }

  const { name, vicinity, rating, user_ratings_total } = preschool;

  return (
    <div className="preschool-card" onClick={() => onSelect(preschool)}>
      <h2>{name || 'Namn saknas'}</h2>
      <div className="preschool-info">
        <div className="info-item">
          <FaMapMarkerAlt className="icon" />
          <p>{vicinity || 'Adress saknas'}</p>
        </div>
        <div className="info-item">
          <FaStar className="icon" />
          <p>{rating || 'Betyg saknas'}</p>
        </div>
        <div className="info-item">
          <FaUsers className="icon" />
          <p>{user_ratings_total || 'Inga betyg'}</p>
        </div>
      </div>
    </div>
  );
};

PreschoolCard.propTypes = {
  preschool: PropTypes.shape({
    name: PropTypes.string,
    vicinity: PropTypes.string,
    rating: PropTypes.number,
    user_ratings_total: PropTypes.number,
  }),
  onSelect: PropTypes.func.isRequired,
};

export default PreschoolCard;

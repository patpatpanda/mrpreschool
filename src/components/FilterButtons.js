import React from 'react';
import PropTypes from 'prop-types';

const FilterButtons = ({ filterTopRatedPlaces, filterNearestPlaces, handleGetCurrentLocation }) => {
  return (
    <div className="filter-container">
      <button className="styled-button filter-button" onClick={filterTopRatedPlaces}>
        Högst-betyg
      </button>
      <button className="styled-button filter-button" onClick={filterNearestPlaces}>
        Närmast
      </button>
      <button className="styled-button filter-button" onClick={handleGetCurrentLocation}>
        Min-Plats
      </button>
    </div>
  );
};

FilterButtons.propTypes = {
  filterTopRatedPlaces: PropTypes.func.isRequired,
  filterNearestPlaces: PropTypes.func.isRequired,
  handleGetCurrentLocation: PropTypes.func.isRequired,
};

export default FilterButtons;

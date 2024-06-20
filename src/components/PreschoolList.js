import React from 'react';
import PropTypes from 'prop-types';
import PreschoolCard from './PreschoolCard';

const PreschoolList = ({ showPlaces, isHidden, expanded, toggleExpand, toggleHide, nearbyPlaces, surveyResponses, handleSelectPlace }) => {
  return (
    <div className={`cards-container ${showPlaces && !isHidden ? 'show' : 'hidden'} ${expanded ? 'expanded' : ''}`}>
      <button className="close-button" onClick={toggleHide}>
        {isHidden ? 'Visa' : 'Dölj'}
      </button>
      <button className="expand-button" onClick={toggleExpand}>
        {expanded ? 'Minska' : 'Utöka'}
      </button>
      {showPlaces && !isHidden && (
        <>
          {nearbyPlaces.map((place) => (
            <PreschoolCard
              key={place.place_id}
              preschool={place}
              onSelect={handleSelectPlace}
              surveyResponses={surveyResponses[place.name] || {}}
            />
          ))}
        </>
      )}
    </div>
  );
};

PreschoolList.propTypes = {
  showPlaces: PropTypes.bool.isRequired,
  isHidden: PropTypes.bool.isRequired,
  expanded: PropTypes.bool.isRequired,
  toggleExpand: PropTypes.func.isRequired,
  toggleHide: PropTypes.func.isRequired,
  nearbyPlaces: PropTypes.array.isRequired,
  surveyResponses: PropTypes.object.isRequired,
  handleSelectPlace: PropTypes.func.isRequired,
};

export default PreschoolList;

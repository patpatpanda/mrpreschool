import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PreschoolCard from './PreschoolCard';
import { ClipLoader } from 'react-spinners';  // Importera spinner-komponenten

const PreschoolList = ({ showPlaces, isHidden, expanded, toggleExpand, toggleHide, nearbyPlaces, surveyResponses, handleSelectPlace }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showPlaces && !isHidden) {
      // Simulera datahämtning
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 2000); // Byt ut detta med faktisk datahämtning
    }
  }, [showPlaces, isHidden]);

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
          {loading ? (
            <div className="spinner-container">
              <ClipLoader color="#000" loading={loading} size={50} />
            </div>
          ) : (
            nearbyPlaces.map((place) => (
              <PreschoolCard
                key={place.place_id}
                preschool={place}
                onSelect={handleSelectPlace}
                surveyResponses={surveyResponses[place.name] || {}}
              />
            ))
          )}
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

import React from 'react';
import PropTypes from 'prop-types';
import '../styles/Sidebar.css';

const Sidebar = ({ places, selectedPlace, onSelect, sidebarOpen, toggleSidebar, walkingTimes }) => {
  return (
    <>
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        {sidebarOpen && (
          <div className="sidebar-content">
            {places.map((place) => (
              <div
                key={place.id}
                className={`sidebar-item ${selectedPlace && selectedPlace.id === place.id ? 'selected' : ''}`}
                onClick={() => onSelect(place)}
              >
                <div className="sidebar-card">
                  <h3>{place.namn}</h3>
                  <p>{place.adress}</p>
                  <p>Helhetsomdöme: {place.pdfData ? place.pdfData.helhetsomdome : 'N/A'}%</p>
                  <p>Gångavstånd: {walkingTimes[place.id]} minuter</p>
                  <p>Antal svar: {place.pdfData ? place.pdfData.antalSvar : 'N/A'}</p>
                  <p>Svarsfrekvens: {place.pdfData ? place.pdfData.svarsfrekvens + '%' : 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <button className={`toggle-button ${sidebarOpen ? 'open' : 'closed'}`} onClick={toggleSidebar}>
        {sidebarOpen ? 'Dölj' : 'Visa'}
      </button>
    </>
  );
};

Sidebar.propTypes = {
  places: PropTypes.array.isRequired,
  selectedPlace: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  sidebarOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  walkingTimes: PropTypes.object.isRequired,
};

export default Sidebar;

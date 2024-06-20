import React from 'react';
import PropTypes from 'prop-types';

const SearchBox = ({ geocoder, map, findNearbyPlaces }) => {
  const geocodeAddress = () => {
    const address = document.getElementById('address').value.trim();
    if (!address) {
      alert('Please enter a valid address.');
      return;
    }

    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK') {
        map.setCenter(results[0].geometry.location);
        new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          },
        });
        findNearbyPlaces(results[0].geometry.location);
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };

  return (
    <div className="search-container">
      <input id="address" type="text" className="styled-input" placeholder="Ange Address" defaultValue="Götgatan 45" />
      <button className="styled-button" onClick={geocodeAddress}>Hitta Förskolor</button>
    </div>
  );
};

SearchBox.propTypes = {
  geocoder: PropTypes.object.isRequired,
  map: PropTypes.object.isRequired,
  findNearbyPlaces: PropTypes.func.isRequired,
};

export default SearchBox;

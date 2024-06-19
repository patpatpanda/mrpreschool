/*global google*/
import React, { useEffect, useRef, useState } from 'react';
import PreschoolCard from './PreschoolCard';
import '../styles/GoogleMap.css';
import '../styles/PreschoolCard.css';

const GoogleMap = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const [infowindow, setInfowindow] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPlaces, setShowPlaces] = useState(false);
  const [originalPlaces, setOriginalPlaces] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const initMap = () => {
      const stockholm = new google.maps.LatLng(59.3293, 18.0686);

      const map = new google.maps.Map(mapRef.current, {
        center: stockholm,
        zoom: 12,
        disableDefaultUI: true
      });
      setMap(map);

      const geocoder = new google.maps.Geocoder();
      setGeocoder(geocoder);

      const infowindow = new google.maps.InfoWindow();
      setInfowindow(infowindow);

      const directionsService = new google.maps.DirectionsService();
      setDirectionsService(directionsService);

      const directionsRenderer = new google.maps.DirectionsRenderer({
        draggable: true,
        map: map,
      });
      setDirectionsRenderer(directionsRenderer);
    };

    const loadScript = (url) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    };

    if (!window.google) {
      loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyCbJmqNnZHTZ99pPQ2uHfkDXwpMxOpfYLw&libraries=places&callback=initMap');
    } else {
      initMap();
    }
  }, []);

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
        });
        findNearbyPlaces(results[0].geometry.location);
        setShowFilters(true);
        setShowPlaces(true); // Ensure cards-container is shown after search
        setIsHidden(false); // Ensure cards-container is visible
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };

  const findNearbyPlaces = (location) => {
    const request = {
      location: location,
      radius: '1000',  // 1 km radius
      keyword: '(förskola OR dagmamma OR föräldrakooperativ)',
    };

    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const validResults = results.filter(place => place.name);
        setNearbyPlaces(validResults);
        setOriginalPlaces(validResults);
        setShowPlaces(true);
        clearMarkers();
        validResults.forEach((result) => createMarker(result, location));
        fitMapToMarkers(validResults);
      } else {
        alert('Places API was not successful for the following reason: ' + status);
      }
    });
  };

  const createMarker = (place, origin) => {
    const placeLoc = place.geometry.location;
    const marker = new google.maps.Marker({
      map: map,
      position: placeLoc,
    });

    marker.addListener('click', () => {
      infowindow.setContent(place.name);
      infowindow.open(map, marker);
      map.setCenter(placeLoc);
      map.setZoom(15);

      setSelectedPlace({
        name: place.name,
        vicinity: place.vicinity,
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        place_id: place.place_id
      });

      calculateAndDisplayRoute(origin, placeLoc);
    });

    setMarkers((prevMarkers) => [...prevMarkers, marker]);
  };

  const fitMapToMarkers = (places) => {
    const bounds = new google.maps.LatLngBounds();
    places.forEach((place) => {
      bounds.extend(place.geometry.location);
    });
    map.fitBounds(bounds);
  };

  const clearMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  };

  const calculateAndDisplayRoute = (origin, destination) => {
    const request = {
      origin: origin,
      destination: destination,
      travelMode: 'DRIVING',
    };
    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
        directionsRenderer.setMap(map);
      } else {
        alert('Directions request failed due to ' + status);
      }
    });
  };

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
  };

  const filterTopRatedPlaces = () => {
    if (originalPlaces.length > 0) {
      const topRatedPlaces = [...originalPlaces].sort((a, b) => b.rating - a.rating).slice(0, 5);
      setNearbyPlaces(topRatedPlaces);
      clearMarkers();
      topRatedPlaces.forEach((place) => createMarker(place, map.getCenter()));
      fitMapToMarkers(topRatedPlaces);
    } else {
      alert('No places found to filter.');
    }
  };

  const filterNearestPlaces = () => {
    if (originalPlaces.length > 0) {
      const nearestPlaces = [...originalPlaces].slice(0, 5);
      setNearbyPlaces(nearestPlaces);
      clearMarkers();
      nearestPlaces.forEach((place) => createMarker(place, map.getCenter()));
      fitMapToMarkers(nearestPlaces);
    } else {
      alert('No places found to filter.');
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const latlng = new google.maps.LatLng(latitude, longitude);

        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === 'OK' && results[0]) {
            document.getElementById('address').value = results[0].formatted_address;
            map.setCenter(latlng);
            new google.maps.Marker({
              map: map,
              position: latlng,
            });
            findNearbyPlaces(latlng);
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
      }, () => {
        alert('Geolocation failed.');
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const toggleHide = () => {
    setIsHidden(!isHidden);
  };

  return (
    <div className="app-container">
      <div ref={mapRef} className="map-container"></div>
      
      <div className="search-container">
        <input id="address" type="text" className="styled-input" placeholder="" defaultValue="Götgatan 45" />
        <button className="styled-button" onClick={geocodeAddress}>Hitta Förskolor</button>
        <div className="location-button-container">
      </div>
      </div>
      
      {showFilters && (
        <div className="filter-container">
          <button className="styled-button filter-button" onClick={filterTopRatedPlaces}>Högst-betyg</button>
          <button className="styled-button filter-button" onClick={filterNearestPlaces}>Närmast</button>
          <button className="styled-button filter-button" onClick={handleGetCurrentLocation}>Min-Plats</button>
        </div>
      )}

      <div className={`cards-container ${showPlaces && !isHidden ? 'show' : 'hidden'} ${expanded ? 'expanded' : ''}`}>
        <button className="close-button" onClick={toggleHide}>{isHidden ? 'Visa' : 'Dölj'}</button>
        <button className="expand-button" onClick={toggleExpand}>
          {expanded ? 'Minska' : 'Utöka'}
        </button>
        {showPlaces && !isHidden && (
          <>
            {nearbyPlaces.map((place) => (
              <PreschoolCard key={place.place_id} preschool={place} onSelect={handleSelectPlace} />
            ))}
          </>
        )}
      </div>
      
      {isHidden && (
        <button className="show-button" onClick={toggleHide}>Visa</button>
      )}
      
      {selectedPlace && (
        <div className="selected-place-card">
          <h2>{selectedPlace.name}</h2>
          {selectedPlace.imageUrl && (
            <img src={selectedPlace.imageUrl} alt={selectedPlace.name} />
          )}
          <p>Address: {selectedPlace.vicinity}</p>
          <p>Rating: {selectedPlace.rating}</p>
          <p>User Ratings: {selectedPlace.user_ratings_total}</p>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;

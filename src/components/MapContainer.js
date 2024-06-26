/* global google */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const MapContainer = ({
  mapRef,
  setMap,
  setGeocoder,
  setInfowindow,
  setDirectionsService,
  setDirectionsRenderer,
  markers,
  setMarkers,
  setDistanceBetweenPlaces,
  setSelectedPlace,
  setShowPlaces,
  fetchSurveyResponses,
  surveyResponses,
  originalPlaces,
  setOriginalPlaces,
  nearbyPlaces,
  setNearbyPlaces,
  createMarker,
  findNearbyPlaces,
  fitMapToMarkers,
  clearMarkers,
  calculateAndDisplayRoute,
}) => {

  useEffect(() => {
    const initMap = () => {
      const stockholm = new google.maps.LatLng(59.3293, 18.0686);

      const map = new google.maps.Map(mapRef.current, {
        center: stockholm,
        zoom: 12,
        disableDefaultUI: true,
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
  }, [mapRef, setMap, setGeocoder, setInfowindow, setDirectionsService, setDirectionsRenderer]);

  return <div ref={mapRef} className="map-container"></div>;
};

MapContainer.propTypes = {
  mapRef: PropTypes.object.isRequired,
  setMap: PropTypes.func.isRequired,
  setGeocoder: PropTypes.func.isRequired,
  setInfowindow: PropTypes.func.isRequired,
  setDirectionsService: PropTypes.func.isRequired,
  setDirectionsRenderer: PropTypes.func.isRequired,
  markers: PropTypes.array.isRequired,
  setMarkers: PropTypes.func.isRequired,
  setDistanceBetweenPlaces: PropTypes.func.isRequired,
  setSelectedPlace: PropTypes.func.isRequired,
  setShowPlaces: PropTypes.func.isRequired,
  fetchSurveyResponses: PropTypes.func.isRequired,
  surveyResponses: PropTypes.object.isRequired,
  originalPlaces: PropTypes.array.isRequired,
  setOriginalPlaces: PropTypes.func.isRequired,
  nearbyPlaces: PropTypes.array.isRequired,
  setNearbyPlaces: PropTypes.func.isRequired,
  createMarker: PropTypes.func.isRequired,
  findNearbyPlaces: PropTypes.func.isRequired,
  fitMapToMarkers: PropTypes.func.isRequired,
  clearMarkers: PropTypes.func.isRequired,
  calculateAndDisplayRoute: PropTypes.func.isRequired,
};

export default MapContainer;
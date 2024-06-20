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
        place_id: place.place_id,
      });

      if (markers.length === 1) {
        const originLocation = markers[0].getPosition();
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          originLocation,
          placeLoc
        );
        setDistanceBetweenPlaces(distance);
      }

      calculateAndDisplayRoute(origin, placeLoc);
    });

    setMarkers((prevMarkers) => [...prevMarkers, marker]);
  };

  const findNearbyPlaces = (location) => {
    const request = {
      location: location,
      radius: '1000', // 1 km radius
      keyword: '(förskola OR dagmamma OR Förskolan)',
    };

    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // Filtrera bort oönskade resultat baserat på namnet
        const validResults = results.filter(
          (place) =>
            place.name.toLowerCase().includes('förskola') ||
            place.name.toLowerCase().includes('dagmamma') ||
            place.name.toLowerCase().includes('förskolan') ||
            place.name.toLowerCase().includes('montessoriförskolan tellus') ||
            place.name.toLowerCase().includes('daghemmet blå huset') ||
            place.name.toLowerCase().includes('kastanjegården') ||
            place.name.toLowerCase().includes('storken montessoriförskola') ||
            place.name.toLowerCase().includes('daghemmet haga')
        );

        // Calculate distances
        const resultsWithDistances = validResults.map((place) => {
          const distance = google.maps.geometry.spherical.computeDistanceBetween(
            location,
            place.geometry.location
          );
          return { ...place, distance };
        });

        setNearbyPlaces(resultsWithDistances);
        setOriginalPlaces(resultsWithDistances);
        setShowPlaces(true);
        clearMarkers();
        resultsWithDistances.forEach((result) => createMarker(result, location));
        fitMapToMarkers(resultsWithDistances);
        resultsWithDistances.forEach((place) => fetchSurveyResponses(place.name)); // Fetch survey responses
      } else {
        alert('Places API was not successful for the following reason: ' + status);
      }
    });
  };

  const fitMapToMarkers = (places) => {
    const bounds = new google.maps.LatLngBounds();
    places.forEach((place) => {
      bounds.extend(place.geometry.location);
    });
    map.fitBounds(bounds);
  };

  const clearMarkers = () => {
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);
    setDistanceBetweenPlaces(null);
  };

  const calculateAndDisplayRoute = (origin, destination) => {
    const request = {
      origin: origin,
      destination: destination,
      travelMode: 'WALKING',
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
};

export default MapContainer;

/*global google*/
import React, { useState, useEffect, useRef } from 'react';
import MapContainer from './MapContainer';
import SearchBox from './SearchBox';
import FilterButtons from './FilterButtons';
import PreschoolList from './PreschoolList';
import '../styles/GoogleMap.css';
import '../styles/PreschoolCard.css';
import axios from 'axios';

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
  const [surveyResponses, setSurveyResponses] = useState({});
  const [distanceBetweenPlaces, setDistanceBetweenPlaces] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL || 'https://masterkinder20240523125154.azurewebsites.net/api';

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
  }, []);

  const fetchSurveyResponses = async (placeName) => {
    try {
      const response = await axios.post(`${apiUrl}/survey/response-percentages`, {
        selectedQuestion: 'Jag är som helhet nöjd med mitt barns förskola',
        selectedForskoleverksamhet: placeName,
      });
      const { responsePercentages, totalResponses } = response.data;
      setSurveyResponses((prev) => ({ 
        ...prev, 
        [placeName]: { responsePercentages, totalResponses }
      }));
    } catch (error) {
      console.error('There was an error fetching the survey responses!', error);
    }
  };

  const filterTopRatedPlaces = () => {
    if (originalPlaces.length > 0) {
      const topRatedPlaces = [...originalPlaces].sort((a, b) => {
        const aResponses = surveyResponses[a.name]?.responsePercentages || {};
        const bResponses = surveyResponses[b.name]?.responsePercentages || {};
        const aRating = aResponses['Instämmer helt'] || 0;
        const bRating = bResponses['Instämmer helt'] || 0;
        return bRating - aRating;
      }).slice(0, 5);
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
      const nearestPlaces = [...originalPlaces].sort((a, b) => a.distance - b.distance).slice(0, 5);
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
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const latlng = new google.maps.LatLng(latitude, longitude);

          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === 'OK' && results[0]) {
              document.getElementById('address').value = results[0].formatted_address;
              map.setCenter(latlng);
              new google.maps.Marker({
                map: map,
                position: latlng,
                icon: {
                  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                },
              });
              findNearbyPlaces(latlng);
            } else {
              alert('Geocode was not successful for the following reason: ' + status);
            }
          });
        },
        () => {
          alert('Geolocation failed.');
        }
      );
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

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
  };

  return (
    <div className="app-container">
      <MapContainer
        mapRef={mapRef}
        setMap={setMap}
        setGeocoder={setGeocoder}
        setInfowindow={setInfowindow}
        setDirectionsService={setDirectionsService}
        setDirectionsRenderer={setDirectionsRenderer}
        markers={markers}
        setMarkers={setMarkers}
        setDistanceBetweenPlaces={setDistanceBetweenPlaces}
        setSelectedPlace={setSelectedPlace}
        setShowPlaces={setShowPlaces}
        fetchSurveyResponses={fetchSurveyResponses}
        surveyResponses={surveyResponses}
        originalPlaces={originalPlaces}
        setOriginalPlaces={setOriginalPlaces}
        nearbyPlaces={nearbyPlaces}
        setNearbyPlaces={setNearbyPlaces}
      />
      <SearchBox geocoder={geocoder} map={map} findNearbyPlaces={findNearbyPlaces} />
      {showFilters && (
        <FilterButtons
          filterTopRatedPlaces={filterTopRatedPlaces}
          filterNearestPlaces={filterNearestPlaces}
          handleGetCurrentLocation={handleGetCurrentLocation}
        />
      )}
      <PreschoolList
        showPlaces={showPlaces}
        isHidden={isHidden}
        expanded={expanded}
        toggleExpand={toggleExpand}
        toggleHide={toggleHide}
        nearbyPlaces={nearbyPlaces}
        surveyResponses={surveyResponses}
        handleSelectPlace={handleSelectPlace}
      />
      {distanceBetweenPlaces !== null && (
        <div className="distance-info">
          <p>Avstånd mellan valda platser: {(distanceBetweenPlaces / 1000).toFixed(2)} km</p>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;

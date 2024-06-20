/* global google */
import React, { useEffect, useRef, useState } from 'react';
import PreschoolCard from './PreschoolCard';
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
      radius: '2000', // 2 km radius
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

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
  };

  const filterTopRatedPlaces = () => {
    if (originalPlaces.length > 0) {
      const topRatedPlaces = [...originalPlaces].sort((a, b) => {
        const aResponses = surveyResponses[a.name] || {};
        const bResponses = surveyResponses[b.name] || {};
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

  return (
    <div className="app-container">
      <div ref={mapRef} className="map-container"></div>

      <div className="search-container">
        <input id="address" type="text" className="styled-input" placeholder="Ange Address" defaultValue="Götgatan 45" />
        <button className="styled-button" onClick={geocodeAddress}>Hitta Förskolor</button>
        <div className="location-button-container"></div>
      </div>

      {showFilters && (
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
      )}

      <div className={`cards-container ${showPlaces && !isHidden ? 'show' : 'hidden'} ${expanded ? 'expanded' : ''}`}>
        <button className="close-button" onClick={toggleHide}>
          {isHidden ? 'Visa' : 'Dölj'}
        </button>
        <button className="styled-button-2" onClick={toggleExpand}>
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

      {isHidden && (
        <button className="show-button" onClick={toggleHide}>
          Visa
        </button>
      )}

      {selectedPlace && (
        <div className="selected-place-card">
          <h2>{selectedPlace.name}</h2>
          {selectedPlace.imageUrl && <img src={selectedPlace.imageUrl} alt={selectedPlace.name} />}
          <p>Address: {selectedPlace.vicinity}</p>
          <p>Rating: {selectedPlace.rating}</p>
          <p>User Ratings: {selectedPlace.user_ratings_total}</p>
        </div>
      )}

      {distanceBetweenPlaces !== null && (
        <div className="distance-info">
          <p>Avstånd mellan valda platser: {(distanceBetweenPlaces / 1000).toFixed(2)} km</p>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;

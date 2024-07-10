import React, { useEffect, useRef, useState, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import PreschoolCard from './PreschoolCard';
import DetailedCard from './DetailedCard';
import '../styles/GoogleMap.css';
import { fetchPdfDataByName, fetchSchoolDetailsByAddress, fetchNearbySchools } from './api';
import { TextField, Button, Container, Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ListIcon from '@mui/icons-material/List';
import MapIcon from '@mui/icons-material/Map';
import kommunalMarker from '../images/icons8-toy-train-64.png';
import friskolaMarker from '../images/icons8-children-48.png';
import axios from 'axios';

/*global google*/

const ResponsiveButton = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const STOCKHOLM_BOUNDS = {
  north: 59.435,
  south: 59.261,
  west: 17.757,
  east: 18.228,
};

const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: `${address}, Stockholm, Sweden`,
        format: 'json',
        addressdetails: 1,
        limit: 1
      },
    });

    if (response.data.length > 0) {
      const result = response.data[0];
      const latitude = parseFloat(result.lat);
      const longitude = parseFloat(result.lon);

      if (
        latitude >= STOCKHOLM_BOUNDS.south &&
        latitude <= STOCKHOLM_BOUNDS.north &&
        longitude >= STOCKHOLM_BOUNDS.west &&
        longitude <= STOCKHOLM_BOUNDS.east
      ) {
        return { latitude, longitude };
      } else {
        console.error('Address is not within Stockholm.');
        return null;
      }
    } else {
      console.error('Geocoding was not successful.');
      return null;
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

const MapComponent = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPlaces, setShowPlaces] = useState(false);
  const [currentMarkers, setCurrentMarkers] = useState([]);
  const [currentInfoWindows, setCurrentInfoWindows] = useState([]);
  const [originMarker, setOriginMarker] = useState(null);
  const [filter, setFilter] = useState('alla');
  const [serviceType, setServiceType] = useState('alla');
  const [view, setView] = useState('list');
  const [walkingTimes, setWalkingTimes] = useState({});
  const [showText, setShowText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const initMap = () => {
      const stockholm = new google.maps.LatLng(59.3293, 18.0686);

      const map = new google.maps.Map(mapRef.current, {
        center: stockholm,
        zoom: 12,
        disableDefaultUI: true,
      });
      setMap(map);
    };

    const loadScript = () => {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCbJmqNnZHTZ99pPQ2uHfkDXwpMxOpfYLw&libraries=places';
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    };

    if (!window.google) {
      loadScript();
    } else {
      initMap();
    }
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleServiceTypeChange = (newServiceType) => {
    setServiceType(newServiceType);
  };

  const findNearbyPlaces = useCallback(async (location) => {
    try {
      const places = await fetchNearbySchools(location.lat(), location.lng(), filter, serviceType);

      if (places.length > 0) {
        // Kontrollera avståndet till den närmaste förskolan
        const nearestPlace = places[0];
        const distanceToNearestPlace = calculateDistance(location, new google.maps.LatLng(nearestPlace.latitude, nearestPlace.longitude));

        if (distanceToNearestPlace > 3) {
          setErrorMessage('För närvarande stödjer vi bara stockholmsområdet. Prova igen.');
          setLoading(false);
          return;
        }

        const detailedResults = await Promise.all(places.map(async (place) => {
          const cleanName = place.namn.replace(/^(Förskola\s+|Förskolan\s+|Dagmamma\s+|Föräldrakooperativ\s+)/i, '').trim();
          const pdfData = await fetchPdfDataByName(cleanName);

          return {
            ...place,
            pdfData: pdfData ? pdfData : null,
            address: place.adress,
            description: place.beskrivning,
          };
        }));

        setNearbyPlaces(detailedResults);
        clearMarkersAndInfoWindows();
        detailedResults.forEach(result => {
          createMarker(result, location);
        });
      } else {
        alert('Inga förskolor hittades på den angivna adressen.');
      }
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      alert('Ett fel inträffade vid hämtning av närliggande förskolor.');
    } finally {
      setLoading(false);
    }
  }, [map, filter, serviceType]);

  const geocodeAddressHandler = useCallback(async () => {
    const address = document.getElementById('address').value.trim();
    if (!address) {
      alert('Please enter a valid address.');
      return;
    }

    setLoading(true);

    const coordinates = await geocodeAddress(address);
    if (coordinates) {
      const { latitude, longitude } = coordinates;
      const location = new google.maps.LatLng(latitude, longitude);

      map.setCenter(location);
      map.setZoom(17);

      if (originMarker) {
        originMarker.setMap(null);
      }

      const marker = new google.maps.Marker({
        map: map,
        position: location,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        },
      });

      setOriginMarker(marker);

      await findNearbyPlaces(location);
      setShowPlaces(true);
      setShowText(false);
      setView('map');
    } else {
      setErrorMessage('För närvarande stödjer vi bara stockholmsområdet. Prova igen.');
      setLoading(false);
    }
  }, [map, originMarker, findNearbyPlaces]);

  const extractRelevantAddress = (fullAddress) => {
    const addressParts = fullAddress.split(',');
    return addressParts[0].trim();
  };

  const calculateWalkingTime = async (origin, destination) => {
    try {
      const response = await axios.get(`https://masterkinder20240523125154.azurewebsites.net/api/Forskolan/walking-time`, {
        params: {
          lat1: origin.lat(),
          lon1: origin.lng(),
          lat2: destination.lat,
          lon2: destination.lng,
        },
      });
      const timeInHours = response.data;
      if (typeof timeInHours !== 'number' || isNaN(timeInHours)) {
        console.error('Invalid response for walking time:', response.data);
        return null;
      }
      const timeInMinutes = timeInHours * 60;
      return timeInMinutes;
    } catch (error) {
      console.error('Error calculating walking time:', error);
      return null;
    }
  };

  const createMarker = async (place, originLocation) => {
    let iconUrl;

    if (place.organisationsform === 'Kommunal') {
      iconUrl = kommunalMarker;
    } else if (place.organisationsform === 'Fristående') {
      iconUrl = friskolaMarker;
    } else {
      iconUrl = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }

    const marker = new google.maps.Marker({
      map: map,
      position: { lat: place.latitude, lng: place.longitude },
      title: place.namn,
      icon: {
        url: iconUrl,
        scaledSize: new google.maps.Size(32, 32),
      },
    });

    const walkingTimeInMinutes = await calculateWalkingTime(originLocation, { lat: place.latitude, lng: place.longitude });
    const formattedWalkingTime = walkingTimeInMinutes !== null && !isNaN(walkingTimeInMinutes) ? walkingTimeInMinutes.toFixed(2) : "N/A";

    setWalkingTimes((prevTimes) => ({
      ...prevTimes,
      [place.id]: formattedWalkingTime,
    }));

    // Lägg till en etikett direkt ovanför markören
    const label = new google.maps.InfoWindow({
      content: `
        <div class="info-window">
          <div class="info-window-title">${place.namn}</div>
          <div class="info-window-rating">Helhetsomdöme: ${place.pdfData ? place.pdfData.helhetsomdome : 'N/A'}%</div>
          <div class="info-window-walking-time">Gångtid: ${formattedWalkingTime} minuter</div>
        </div>
      `,
      disableAutoPan: true,
    });

    // Visa endast info-window om kartan är tillräckligt inzoomad
    const zoomLevel = map.getZoom();
    if (zoomLevel >=  17) { // Justera zoomnivån enligt behov
      label.open(map, marker);
    }

    marker.addListener('click', () => {
      label.open(map, marker);
      selectPlace(place, true);
    });

    setCurrentMarkers((prevMarkers) => [...prevMarkers, marker]);
    setCurrentInfoWindows((prevWindows) => [...prevWindows, label]);

    // Lägg till en listener för att öppna infowindow om kartan zoomas in tillräckligt
    google.maps.event.addListener(map, 'zoom_changed', () => {
      const newZoomLevel = map.getZoom();
      if (newZoomLevel >= 17) { // Justera zoomnivån enligt behov
        label.open(map, marker);
      } else {
        label.close();
      }
    });
  };

  const selectPlace = async (place, showDetailedCard = true) => {
    const cleanName = place.namn.replace(/^(Förskola\s+|Förskolan\s+|Dagmamma\s+|Föräldrakooperativet\s+)/i, '').trim();
    const pdfData = await fetchPdfDataByName(cleanName);
    const relevantAddress = extractRelevantAddress(place.adress);
    const schoolDetails = await fetchSchoolDetailsByAddress(relevantAddress);

    const detailedPlace = {
      ...place,
      pdfData: pdfData ? pdfData : null,
      schoolDetails: schoolDetails ? schoolDetails : null,
    };

    if (showDetailedCard) {
      setSelectedPlace(detailedPlace);
    } else {
      setSelectedPlace(null);
    }
  };

  const handleCardSelect = (place) => {
    selectPlace(place);
  };

  const clearMarkersAndInfoWindows = () => {
    currentMarkers.forEach(marker => marker.setMap(null));
    currentInfoWindows.forEach(infowindow => infowindow.close());
    setCurrentMarkers([]);
    setCurrentInfoWindows([]);
  };

  const toggleView = () => {
    setView(view === 'map' ? 'list' : 'map');
  };

  const filterAndSortPreschools = (places, origin) => {
    const filteredPlaces = places.filter(place => {
      const distance = calculateDistance(origin, new google.maps.LatLng(place.latitude, place.longitude));
      return distance <= 2 && place.pdfData && place.pdfData.antalSvar >= 12;
    });

    const sortedPlaces = filteredPlaces.sort((a, b) => b.pdfData.helhetsomdome - a.pdfData.helhetsomdome);

    return sortedPlaces.slice(0, 5);
  };

  const handleTopRanked = () => {
    if (!originMarker) {
      alert('Ange en adress först.');
      return;
    }

    const topPlaces = filterAndSortPreschools(nearbyPlaces, originMarker.getPosition());

    setNearbyPlaces(topPlaces);
    clearMarkersAndInfoWindows();
    topPlaces.forEach(result => {
      createMarker(result, originMarker.getPosition());
    });
  };

  const filterClosestPreschools = () => {
    if (!originMarker) {
      alert('Ange en adress först.');
      return;
    }

    const sortedPlaces = nearbyPlaces.sort((a, b) => {
      const distanceA = calculateDistance(originMarker.getPosition(), new google.maps.LatLng(a.latitude, a.longitude));
      const distanceB = calculateDistance(originMarker.getPosition(), new google.maps.LatLng(b.latitude, b.longitude));

      return distanceA - distanceB;
    });

    const closestPlaces = sortedPlaces.slice(0, 5);

    setNearbyPlaces(closestPlaces);
    clearMarkersAndInfoWindows();
    closestPlaces.forEach(result => {
      createMarker(result, originMarker.getPosition());
    });
  };

  const calculateDistance = (origin, destination) => {
    const R = 6371;
    const dLat = (destination.lat() - origin.lat()) * Math.PI / 180;
    const dLng = (destination.lng() - origin.lng()) * Math.PI / 180;
    const a =
      0.5 - Math.cos(dLat) / 2 +
      Math.cos(origin.lat() * Math.PI / 180) * Math.cos(destination.lat() * Math.PI / 180) *
      (1 - Math.cos(dLng)) / 2;

    return R * 2 * Math.asin(Math.sqrt(a));
  };

  useEffect(() => {
    if (originMarker) {
      findNearbyPlaces(originMarker.getPosition());
    }
  }, [filter, serviceType]);

  // Lägg till dessa eventlyssnare
  useEffect(() => {
    const addressInput = document.getElementById('address');
    const disableMapZoom = () => map.setOptions({ gestureHandling: 'none' });
    const enableMapZoom = () => map.setOptions({ gestureHandling: 'auto' });

    if (addressInput) {
      addressInput.addEventListener('focus', disableMapZoom);
      addressInput.addEventListener('blur', enableMapZoom);
    }

    return () => {
      if (addressInput) {
        addressInput.removeEventListener('focus', disableMapZoom);
        addressInput.removeEventListener('blur', enableMapZoom);
      }
    };
  }, [map]);

  return (
    <div className="app-container">
      {showText && (
        <div className="initial-text">
          <h1>Förskolekollen.se</h1>
        </div>
      )}
      <div className={`search-container ${showPlaces ? 'top' : 'center'}`}>
        <Container maxWidth="sm">
          <Box display="flex" alignItems="center" justifyContent="center" flexWrap="wrap" gap={2}>
            {showPlaces && (
              <Box display="flex" justifyContent="center" width="100%" gap={2} mt={2}>
                <Button onClick={filterClosestPreschools} variant="contained" color="secondary">
                  Närmsta 5
                </Button>
                <Button onClick={handleTopRanked} variant="contained" color="secondary">
                  Högst rank
                </Button>
                <Button onClick={() => handleFilterChange('Fristående')} variant="contained" color="secondary">
                  Fristående
                </Button>
                <Button onClick={() => handleFilterChange('Kommunal')} variant="contained" color="secondary">
                  Kommunal
                </Button>
                <ResponsiveButton onClick={() => handleServiceTypeChange('Förskola')} variant="contained" color="secondary">
                  Förskola
                </ResponsiveButton>
                <ResponsiveButton onClick={() => handleServiceTypeChange('Pedagogisk omsorg')} variant="contained" color="secondary">
                  Dagmamma
                </ResponsiveButton>
              </Box>
            )}
            <TextField
              id="address"
              variant="outlined"
              placeholder="Skriv din adress för att hitta förskola"
              fullWidth
              sx={{ backgroundColor: 'white', color: 'black' }}
              InputProps={{
                style: { color: 'black' },
                endAdornment: (
                  <Button onClick={geocodeAddressHandler} variant="contained" color="primary" startIcon={<SearchIcon />}>
                    Sök
                  </Button>
                ),
              }}
            />

            <Box display="flex" justifyContent="center" width="100%" mt={2} gap={2}>
              <Button onClick={toggleView} variant="contained" color="secondary" startIcon={view === 'map' ? <ListIcon /> : <MapIcon />}>
                {view === 'map' ? 'Visa Lista' : 'Visa Karta'}
              </Button>
            </Box>
          </Box>
        </Container>
      </div>

      {loading && (
        <div className="loading-spinner">
          <CircularProgress />
        </div>
      )}

      <div ref={mapRef} className={`map-container ${view === 'list' ? 'hidden' : ''}`}></div>

      <div className={`cards-container ${view === 'map' ? 'hidden' : ''}`}>
        {showPlaces && nearbyPlaces.length > 0 ? (
          nearbyPlaces.map((place) => (
            <PreschoolCard
              key={place.id}
              preschool={place}
              walkingTime={walkingTimes[place.id]}
              onSelect={handleCardSelect}
            />
          ))
        ) : (
          <p></p>
        )}
      </div>

      {selectedPlace && (
        <DetailedCard
          schoolData={selectedPlace}
          onClose={() => setSelectedPlace(null)}
        />
      )}

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
        className="custom-snackbar"
      >
        <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MapComponent;
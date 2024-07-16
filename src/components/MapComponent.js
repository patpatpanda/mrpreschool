import React, { useEffect, useRef, useState, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import PreschoolCard from './PreschoolCard';
import DetailedCard from './DetailedCard';
import SplashScreen from './SplashScreen'; // Import the SplashScreen component
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

const SERGELSTORG_COORDINATES = {
  latitude: 59.33258,
  longitude: 18.0649,
};

const geocodeAddress = async (address) => {
  console.log('Geocoding address:', address); // Log for debugging
  try {
    const fullAddress = `${address}, Stockholm, Sweden`; // Specificera Stockholm som en del av adressen
    const response = await axios.get(`https://masterkinder20240523125154.azurewebsites.net/api/Forskolan/geocode/${encodeURIComponent(fullAddress)}`);
    const data = response.data;

    if (data && data.latitude && data.longitude) {
      return { latitude: data.latitude, longitude: data.longitude };
    } else {
      console.error('Geocoding was not successful. Data:', data);
      return null;
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

const MapComponent = () => {
  const mapRef = useRef(null);
  const addressRef = useRef(null); // Create a reference for the address input
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
  const [infoWindowsVisible, setInfoWindowsVisible] = useState(true);
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  useEffect(() => {
    const initMap = () => {
      const stockholm = new google.maps.LatLng(59.3293, 18.0686);

      const map = new google.maps.Map(mapRef.current, {
        center: stockholm,
        zoom: 12,
        disableDefaultUI: true,
      });
      setMap(map);

      // Initialize Autocomplete
      if (addressRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(addressRef.current, {
          bounds: {
            north: STOCKHOLM_BOUNDS.north,
            south: STOCKHOLM_BOUNDS.south,
            east: STOCKHOLM_BOUNDS.east,
            west: STOCKHOLM_BOUNDS.west,
          },
          componentRestrictions: { country: 'se' },
          fields: ['geometry'],
          strictBounds: false,
          types: ['address'],
        });

        autocomplete.addListener('place_changed', () => {
          // Autocomplete listener remains to populate the input, but no search is triggered here
        });
      }
    };

    const loadScript = () => {
      const script = document.createElement('script');
      script.src =
        'https://maps.googleapis.com/maps/api/js?key=AIzaSyCbJmqNnZHTZ99pPQ2uHfkDXwpMxOpfYLw&libraries=places';
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

  const findNearbyPlaces = useCallback(async (location) => {
    try {
      setLoading(true); // Start loading indicator
      console.log('Fetching nearby places for location:', location); // Log for debugging
      const places = await fetchNearbySchools(location.lat(), location.lng(), filter, serviceType);

      if (places.length > 0) {
        const nearestPlace = places[0];
        const distanceToNearestPlace = calculateDistance(
          location,
          new google.maps.LatLng(nearestPlace.latitude, nearestPlace.longitude)
        );

        if (distanceToNearestPlace > 3) {
          setErrorMessage('För närvarande stödjer vi bara stockholmsområdet. Prova igen.');
          setLoading(false);
          return;
        }

        const detailedResults = await Promise.all(
          places.map(async (place) => {
            const cleanName = place.namn
              .replace(/^(Förskola\s+|Förskolan\s+|Dagmamma\s+|Föräldrakooperativ\s+)/i, '')
              .trim();
            const pdfData = await fetchPdfDataByName(cleanName);

            return {
              ...place,
              pdfData: pdfData ? pdfData : null,
              address: place.adress,
              description: place.beskrivning,
            };
          })
        );

        setNearbyPlaces(detailedResults);
        clearMarkersAndInfoWindows();
        detailedResults.forEach((result) => {
          createMarker(result, location);
        });
      } else {
        setErrorMessage('Inga förskolor hittades på den angivna adressen.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      setErrorMessage('Ett fel inträffade vid hämtning av närliggande förskolor.');
      setLoading(false);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  }, [map, filter, serviceType]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleServiceTypeChange = (newServiceType) => {
    setServiceType(newServiceType);
  };

  const extractRelevantAddress = (fullAddress) => {
    const addressParts = fullAddress.split(',');
    return addressParts[0].trim();
  };

  const geocodeAddressHandler = useCallback(async () => {
    const address = document.getElementById('address').value.trim();
    if (!address) {
      setErrorMessage('Ange en giltig adress.');
      return;
    }

    setLoading(true);

    const relevantAddress = extractRelevantAddress(address);
    console.log('Relevant address extracted:', relevantAddress); // Log for debugging
    const coordinates = await geocodeAddress(relevantAddress);
    console.log('Coordinates:', coordinates); // Log coordinates for debugging

    if (
      !coordinates ||
      (coordinates.latitude === SERGELSTORG_COORDINATES.latitude &&
        coordinates.longitude === SERGELSTORG_COORDINATES.longitude)
    ) {
      console.log('Geocoding failed or out of bounds.');
      setErrorMessage('För närvarande stödjer vi bara stockholmsområdet. Prova igen.');
      setLoading(false);
      return;
    }

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
  }, [map, originMarker, findNearbyPlaces]);

  const calculateWalkingTime = async (origin, destination) => {
    try {
      const response = await axios.get(
        `https://masterkinder20240523125154.azurewebsites.net/api/Forskolan/walking-time`,
        {
          params: {
            lat1: origin.lat(),
            lon1: origin.lng(),
            lat2: destination.lat,
            lon2: destination.lng,
          },
        }
      );
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

    const walkingTimeInMinutes = await calculateWalkingTime(originLocation, {
      lat: place.latitude,
      lng: place.longitude,
    });
    const formattedWalkingTime =
      walkingTimeInMinutes !== null && !isNaN(walkingTimeInMinutes)
        ? walkingTimeInMinutes.toFixed(2)
        : 'N/A';

    setWalkingTimes((prevTimes) => ({
      ...prevTimes,
      [place.id]: formattedWalkingTime,
    }));

    const label = new google.maps.InfoWindow({
      content: `
        <div class="info-window" style="pointer-events: none;">
          <div class="info-window-title">${place.namn}</div>
          <div class="info-window-rating">Helhetsomdöme: ${
            place.pdfData ? place.pdfData.helhetsomdome : 'N/A'
          }%</div>
          <div class="info-window-walking-time">Gångtid: ${formattedWalkingTime} minuter</div>
        </div>
      `,
      disableAutoPan: true,
    });

    label.open(map, marker);

    marker.addListener('click', () => {
      label.open(map, marker);
      selectPlace(place, true);
    });

    setCurrentMarkers((prevMarkers) => [...prevMarkers, marker]);
    setCurrentInfoWindows((prevWindows) => [...prevWindows, label]);
  };

  const selectPlace = async (place, showDetailedCard = true) => {
    const cleanName = place.namn
      .replace(/^(Förskola\s+|Förskolan\s+|Dagmamma\s+|Föräldrakooperativet\s+)/i, '')
      .trim();
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
    currentMarkers.forEach((marker) => marker.setMap(null));
    currentInfoWindows.forEach((infowindow) => infowindow.close());
    setCurrentMarkers([]);
    setCurrentInfoWindows([]);
  };

  const toggleView = () => {
    setView(view === 'map' ? 'list' : 'map');
  };

  const toggleInfoWindows = () => {
    if (infoWindowsVisible) {
      currentInfoWindows.forEach((infoWindow) => infoWindow.close());
    } else {
      currentInfoWindows.forEach((infoWindow) => infoWindow.open(map, infoWindow.anchor));
    }
    setInfoWindowsVisible(!infoWindowsVisible);
  };

  const filterAndSortPreschools = (places, origin) => {
    const filteredPlaces = places.filter((place) => {
      const distance = calculateDistance(
        origin,
        new google.maps.LatLng(place.latitude, place.longitude)
      );
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
    topPlaces.forEach((result) => {
      createMarker(result, originMarker.getPosition());
    });
  };

  const filterClosestPreschools = () => {
    if (!originMarker) {
      alert('Ange en adress först.');
      return;
    }

    const sortedPlaces = nearbyPlaces.sort((a, b) => {
      const distanceA = calculateDistance(
        originMarker.getPosition(),
        new google.maps.LatLng(a.latitude, a.longitude)
      );
      const distanceB = calculateDistance(
        originMarker.getPosition(),
        new google.maps.LatLng(b.latitude, b.longitude)
      );

      return distanceA - distanceB;
    });

    const closestPlaces = sortedPlaces.slice(0, 5);

    setNearbyPlaces(closestPlaces);
    clearMarkersAndInfoWindows();
    closestPlaces.forEach((result) => {
      createMarker(result, originMarker.getPosition());
    });
  };

  const calculateDistance = (origin, destination) => {
    const R = 6371;
    const dLat = (destination.lat() - origin.lat()) * Math.PI / 180;
    const dLng = (destination.lng() - origin.lng()) * Math.PI / 180;
    const a =
      0.5 -
      Math.cos(dLat) / 2 +
      (Math.cos(origin.lat() * Math.PI / 180) *
        Math.cos(destination.lat() * Math.PI / 180) *
        (1 - Math.cos(dLng))) /
        2;

    return R * 2 * Math.asin(Math.sqrt(a));
  };

  useEffect(() => {
    if (originMarker) {
      findNearbyPlaces(originMarker.getPosition());
    }
  }, [filter, serviceType]);

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
      {showSplashScreen && <SplashScreen onProceed={() => setShowSplashScreen(false)} />}
      {showText && (
        <div className="initial-text">
          
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
              inputRef={addressRef}
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
              <Button onClick={toggleInfoWindows} variant="contained" color="secondary">
                {infoWindowsVisible ? 'Dölj Info-Fönster' : 'Visa Info-Fönster'}
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

/*global google*/
import React, { useEffect, useRef, useState, useCallback } from 'react';
import PreschoolCard from './PreschoolCard';
import DetailedCard from './DetailedCard';
import '../styles/GoogleMap.css';
import { fetchSchoolDetailsByGoogleName, fetchSchoolDetailsByAddress } from './api';

const MapComponent = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const [infowindow, setInfowindow] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPlaces, setShowPlaces] = useState(false);
  const [markers, setMarkers] = useState([]);

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

  const geocodeAddress = useCallback(() => {
    const address = document.getElementById('address').value.trim();
    if (!address) {
      alert('Please enter a valid address.');
      return;
    }

    geocoder.geocode({ address: address }, async (results, status) => {
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
        setShowPlaces(true);
      } else {
        alert('Search was not successful for the following reason: ' + status);
      }
    });
  }, [geocoder, map]);

  const extractRelevantAddress = (fullAddress) => {
    const addressParts = fullAddress.split(',');
    return addressParts[0].trim();
  };

  const findNearbyPlaces = useCallback(async (location) => {
    const request = {
      location: location,
      radius: '400',
      keyword: '(förskola OR dagmamma OR Förskolan)',
    };

    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, async (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const validResults = results.filter(place =>
          place.name.toLowerCase().includes('förskola') ||
          place.name.toLowerCase().includes('dagmamma') ||
          place.name.toLowerCase().includes('förskolan')
        );

        const detailedResults = await Promise.all(validResults.map(async (place) => {
          const cleanName = place.name.replace(/^(Förskola\s+|Förskolan\s+)|(\s+Förskola|\s+Förskolan)$/i, '').trim();
          const pdfData = await fetchSchoolDetailsByGoogleName(cleanName);
          const relevantAddress = extractRelevantAddress(place.vicinity);
          const schoolDetails = await fetchSchoolDetailsByAddress(relevantAddress);
          return { ...place, pdfData, schoolDetails };
        }));

        setNearbyPlaces(detailedResults);
        clearMarkers();
        validResults.forEach(result => createMarker(result));
      } else {
        alert('Places API was not successful for the following reason: ' + status);
      }
    });
  }, [map]);

  const createMarker = (place) => {
    const marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
    });

    marker.addListener('click', async () => {
      infowindow.setContent(place.name);
      infowindow.open(map, marker);

      const cleanName = place.name.replace(/^(Förskola\s+|Förskolan\s+)|(\s+Förskola|\s+Förskolan)$/i, '').trim();
      const pdfData = await fetchSchoolDetailsByGoogleName(cleanName);
      const relevantAddress = extractRelevantAddress(place.vicinity);
      const schoolDetails = await fetchSchoolDetailsByAddress(relevantAddress);

      setSelectedPlace({ ...place, pdfData, schoolDetails });
    });

    setMarkers((prevMarkers) => [...prevMarkers, marker]);
  };

  const clearMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  };

  return (
    <div className="app-container">
      <div ref={mapRef} className="map-container"></div>

      <div className="search-container">
        <input id="address" type="text" className="styled-input" placeholder="Ange Address eller Förskolans Namn" />
        <button className="styled-button" onClick={geocodeAddress}>Hitta Förskolor</button>
      </div>

      <div className="cards-container">
        {showPlaces && nearbyPlaces.map((place) => (
          <PreschoolCard
            key={place.place_id}
            preschool={place}
            onSelect={(data) => setSelectedPlace(data)}
          />
        ))}
      </div>

      {selectedPlace && (
        <DetailedCard schoolData={selectedPlace} onClose={() => setSelectedPlace(null)} />
      )}
    </div>
  );
};

export default MapComponent;


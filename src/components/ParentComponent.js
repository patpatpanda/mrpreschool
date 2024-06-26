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

    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK') {
        console.log('Geocoded address:', results[0].formatted_address);
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

  const findNearbyPlaces = useCallback((location) => {
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
          const pdfData = await fetchSchoolDetailsByGoogleName(place.name);
          return { ...place, pdfData };
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

    marker.addListener('click', () => {
      infowindow.setContent(place.name);
      infowindow.open(map, marker);
      selectPlaceWithAddress(place);
    });

    setMarkers((prevMarkers) => [...prevMarkers, marker]);
  };

  const selectPlaceWithAddress = async (place) => {
    // Only take the first part of the address for the API call
    const addressParts = place.vicinity.split(',')[0];
    const encodedAddress = encodeURIComponent(addressParts);

    const schoolDetails = await fetchSchoolDetailsByAddress(encodedAddress);
    console.log('API response for address:', schoolDetails); // Log the API response
    if (schoolDetails && schoolDetails.$values && schoolDetails.$values.length > 0) {
      const placeDetails = schoolDetails.$values[0]; // Assuming the first result is the one we want
      const detailedPlace = {
        ...place,
        address: placeDetails.adress,
        description: placeDetails.beskrivning,
        TypAvService: placeDetails.typAvService, // Ensure matching case with API response
        VerksamI: placeDetails.verksamI, // Ensure matching case with API response
        Organisationsform: placeDetails.organisationsform, // Ensure matching case with API response
        AntalBarn: placeDetails.antalBarn, // Ensure matching case with API response
        AntalBarnPerArsarbetare: placeDetails.antalBarnPerArsarbetare, // Ensure matching case with API response
        AndelLegitimeradeForskollarare: placeDetails.andelLegitimeradeForskollarare, // Ensure matching case with API response
        Webbplats: placeDetails.webbplats, // Ensure matching case with API response
        InriktningOchProfil: placeDetails.inriktningOchProfil, // Ensure matching case with API response
        InneOchUtemiljo: placeDetails.inneOchUtemiljo, // Ensure matching case with API response
        KostOchMaltider: placeDetails.kostOchMaltider, // Ensure matching case with API response
        MalOchVision: placeDetails.malOchVision, // Ensure matching case with API response
        MerOmOss: placeDetails.merOmOss, // Ensure matching case with API response
        pdfData: place.pdfData
      };
      console.log('Selected place with address details:', detailedPlace); // Log the detailed place object
      setSelectedPlace(detailedPlace);
    } else {
      setSelectedPlace(place);
    }
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
            onSelect={selectPlaceWithAddress}
          />
        ))}
      </div>

      {selectedPlace && (
        <div className="detailed-card">
          <div>
            <button onClick={() => setSelectedPlace(null)}>Close</button>
            <DetailedCard schoolData={selectedPlace} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;

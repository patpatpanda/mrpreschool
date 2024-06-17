import React, { useEffect, useRef, useState } from 'react';
import PreschoolCard from './PreschoolCard';
import '../styles/GoogleMap.css';
import kinderImage from '../images/kinder.webp';

const GoogleMap = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const [infowindow, setInfowindow] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [nearbyPreschools, setNearbyPreschools] = useState([]);
  const [selectedPreschool, setSelectedPreschool] = useState(null);
  const [showPreschools, setShowPreschools] = useState(true); // State to manage visibility of the cards container

  const localPreschoolData = {
    "Förskola Kastanjebacken": {
      name: "Förskola Kastanjebacken",
      imageUrl: kinderImage,
      description: "Förskola Kastanjebacken är en utmärkt skola med fantastisk personal och bra aktiviteter för barnen.",
    }
  };

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
    const address = document.getElementById('address').value;
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK') {
        map.setCenter(results[0].geometry.location);
        new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
        });
        findNearbyPreschools(results[0].geometry.location);
        // Move content to the left
        document.querySelector('.content').classList.remove('center');
        document.querySelector('.content').classList.add('left');
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };

  const findNearbyPreschools = (location) => {
    const request = {
      location: location,
      radius: '2000',
      keyword: 'förskola',
    };

    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        const updatedResults = results.map(result => {
          const localData = localPreschoolData[result.name];
          return {
            ...result,
            ...localData
          };
        });
        setNearbyPreschools(updatedResults.slice(0, 5));
        updatedResults.slice(0, 5).forEach((result) => createMarker(result, location));
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

      setShowDirections(true);
      calculateAndDisplayRoute(origin, placeLoc);
    });
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
        directionsRenderer.setPanel(document.getElementById('right-panel'));
      } else {
        alert('Directions request failed due to ' + status);
      }
    });
  };

  const closeDirections = () => {
    setShowDirections(false);
    directionsRenderer.setPanel(null);
    directionsRenderer.setMap(null);
  };

  const handleReset = () => {
    window.location.reload();
  };

  const handleSelectPreschool = (preschool) => {
    const localData = localPreschoolData[preschool.name];
    if (localData) {
      setSelectedPreschool({ ...preschool, ...localData });
    } else {
      setSelectedPreschool(preschool);
    }
  };

  return (
    <div className="app-container">
      <div ref={mapRef} className="map-container">
        <div className="map-background"></div>
      </div>
      <header className="app-header">
        <h1>Förskolor i Stockholm</h1>
      </header>
      <div className="content center">
        <div className="input-container">
          <input id="address" type="text" className="styled-input" placeholder="Ange din Address" defaultValue="Sergels torg 1, 111 57 Stockholm, Sverige" />
          <button className="styled-button" onClick={geocodeAddress}>Hitta Förskolor</button>
          <button className="styled-button" onClick={handleReset}>Återställ Sidan</button>
        </div>
        
        {showPreschools && (
          <div className="cards-container">
            <button className="close-button" onClick={() => setShowPreschools(false)}>Stäng</button>
            {nearbyPreschools.map((preschool) => (
              <PreschoolCard key={preschool.place_id} preschool={preschool} onSelect={handleSelectPreschool} />
            ))}
          </div>
        )}
        
        {selectedPreschool && (
          <div className="selected-preschool-card">
            <h2>{selectedPreschool.name}</h2>
            {selectedPreschool.imageUrl && (
              <img src={selectedPreschool.imageUrl} alt={selectedPreschool.name} />
            )}
            <p>{selectedPreschool.description}</p>
            <p>Address: {selectedPreschool.vicinity}</p>
            <p>Rating: {selectedPreschool.rating}</p>
            <p>User Ratings: {selectedPreschool.user_ratings_total}</p>
            <button className="close-button" onClick={() => setSelectedPreschool(null)}>Stäng</button>
          </div>
        )}
      </div>
      {showDirections && (
        <div id="right-panel" className="right-panel">
          <button className="close-button" onClick={closeDirections}>Stäng</button>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;

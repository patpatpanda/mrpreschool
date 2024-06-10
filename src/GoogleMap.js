/* global google */
import React, { useEffect, useRef, useState } from 'react';

const GoogleMap = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const [infowindow, setInfowindow] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  useEffect(() => {
    const initMap = () => {
      const stockholm = new google.maps.LatLng(59.3293, 18.0686);

      const map = new google.maps.Map(mapRef.current, {
        center: stockholm,
        zoom: 12,
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
        panel: document.getElementById('right-panel'),
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
        findNearbyPreschools(results[0].geometry.location, results[0].geometry.location);
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };

  const findNearbyPreschools = (location, origin) => {
    const request = {
      location: location,
      radius: '2000',
      keyword: 'förskola',
    };

    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        results.forEach((result) => createMarker(result, origin));
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
      } else {
        alert('Directions request failed due to ' + status);
      }
    });
  };

  return (
    <div>
      <div className="input-container">
        <input id="address" type="text" className="styled-input" placeholder="Ange din Address" defaultValue="Sergels torg 1, 111 57 Stockholm, Sverige" />
        <button className="styled-button" onClick={geocodeAddress}>Hitta Förskolor</button>
      </div>
      <div className="map-container">
        <div id="map" ref={mapRef} style={{ height: '500px', width: '100%' }}></div>
        <div id="right-panel"></div>
      </div>
    </div>
  );
};

export default GoogleMap;

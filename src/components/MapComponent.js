import React, { useEffect, useRef, useState, useCallback } from 'react';
import PreschoolCard from './PreschoolCard';
import DetailedCard from './DetailedCard';
import '../styles/GoogleMap.css';
import { fetchPdfDataByName, fetchSchoolDetailsByAddress, fetchNearbySchools } from './api';

/*global google*/

const MapComponent = () => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [geocoder, setGeocoder] = useState(null);
    const [infowindow, setInfowindow] = useState(null);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [showPlaces, setShowPlaces] = useState(false);
    const [currentMarkers, setCurrentMarkers] = useState([]);
    const [originMarker, setOriginMarker] = useState(null);
    const [directionsService, setDirectionsService] = useState(null);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);
    const [filter, setFilter] = useState('alla');
    const [view, setView] = useState('map');

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
                suppressMarkers: true,
                polylineOptions: {
                    strokeColor: '#39b1b9',
                    strokeOpacity: 0.7,
                    strokeWeight: 5,
                    icons: [{
                        icon: {
                            path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
                            scale: 3,
                            strokeColor: '#39b1b9',
                            strokeOpacity: 0.8
                        },
                        repeat: '20px'
                    }]
                }
            });
            directionsRenderer.setMap(map);
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
            loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyCbJmqNnZHTZ99pPQ2uHfkDXwpMxOpfYLw&libraries=places');
        } else {
            initMap();
        }
    }, []);

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    const findNearbyPlaces = useCallback(async (location) => {
        try {
            console.log(`Fetching nearby places for lat: ${location.lat()}, lng: ${location.lng()} with filter: ${filter}`);
            const places = await fetchNearbySchools(location.lat(), location.lng(), filter);

            if (places.length > 0) {
                console.log("Nearby places found:", places);
                const detailedResults = await Promise.all(places.map(async (place) => {
                    const cleanName = place.namn.replace(/^(Förskola\s+|Förskolan\s+)/i, '').trim();
                    const pdfData = await fetchPdfDataByName(cleanName);

                    return {
                        ...place,
                        pdfData: pdfData ? pdfData : null,
                        address: place.adress,
                        description: place.beskrivning,
                    };
                }));

                console.log("Detailed results:", detailedResults);
                setNearbyPlaces(detailedResults);
                clearMarkers();
                detailedResults.forEach(result => createMarker(result));
            } else {
                alert('Inga förskolor hittades på den angivna adressen.');
            }
        } catch (error) {
            console.error('Error fetching nearby places:', error);
            alert('Ett fel inträffade vid hämtning av närliggande förskolor.');
        }
    }, [map, filter]);

    const geocodeAddress = useCallback(() => {
        const address = document.getElementById('address').value.trim();
        if (!address) {
            alert('Please enter a valid address.');
            return;
        }

        geocoder.geocode({ address: address }, async (results, status) => {
            if (status === 'OK') {
                map.setCenter(results[0].geometry.location);
                

                if (originMarker) {
                    originMarker.setMap(null);
                }

                const marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    icon: {
                        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    },
                });

                setOriginMarker(marker);

                console.log("Geocoded location:", results[0].geometry.location);
                findNearbyPlaces(results[0].geometry.location);
                setShowPlaces(true);
            } else {
                alert('Search was not successful for the following reason: ' + status);
            }
        });
    }, [geocoder, map, originMarker, findNearbyPlaces]);

    const extractRelevantAddress = (fullAddress) => {
        const addressParts = fullAddress.split(',');
        return addressParts[0].trim();
    };

    const createMarker = (place) => {
        const marker = new google.maps.Marker({
            map: map,
            position: { lat: place.latitude, lng: place.longitude },
            title: place.namn
        });

        marker.addListener('click', () => {
            selectPlace(place);
        });

        setCurrentMarkers((prevMarkers) => [...prevMarkers, marker]);
    };

    const selectPlace = async (place) => {
        const cleanName = place.namn.replace(/^(Förskola\s+|Förskolan\s+)/i, '').trim();
        const pdfData = await fetchPdfDataByName(cleanName);
        const relevantAddress = extractRelevantAddress(place.adress);
        const schoolDetails = await fetchSchoolDetailsByAddress(relevantAddress);

        const detailedPlace = {
            ...place,
            pdfData: pdfData ? pdfData : null,
            schoolDetails: schoolDetails ? schoolDetails : null,
        };

        console.log("Selected place details:", detailedPlace);
        setSelectedPlace(detailedPlace);

        if (view === 'map') {
            calculateRoute(document.getElementById('address').value.trim(), { lat: place.latitude, lng: place.longitude }, place);
        }
    };

    const handleCardSelect = (place) => {
        selectPlace(place);
    };

    const clearMarkers = () => {
        currentMarkers.forEach(marker => marker.setMap(null));
        setCurrentMarkers([]);
    };

    const calculateRoute = (origin, destination, place) => {
        const request = {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.WALKING,
        };

        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);
                const route = result.routes[0];
                const duration = route.legs[0].duration.text;
                infowindow.setContent(`${place.namn}<br>Gångtid: ${duration}`);
                infowindow.open(map, currentMarkers.find(marker => marker.getPosition().lat() === place.latitude && marker.getPosition().lng() === place.longitude));
            } else {
                alert('Could not display directions due to: ' + status);
            }
        });
    };

    const toggleView = () => {
        setView(view === 'map' ? 'list' : 'map');
    };

    useEffect(() => {
        console.log("View changed to:", view);
    }, [view]);

    useEffect(() => {
        console.log("Nearby places updated:", nearbyPlaces);
    }, [nearbyPlaces]);

    return (
        <div className="app-container">
            <div className="search-container">
                <input id="address" type="text" className="styled-input" placeholder="Ange Address eller Förskolans Namn" />
                <button className="styled-button" onClick={geocodeAddress}>Hitta Förskolor</button>
                <select className="styled-select" value={filter} onChange={handleFilterChange}>
                    <option value="alla">Alla</option>
                    <option value="Fristående">Fristående</option>
                    <option value="kommunal">Kommunal</option>
                    <option value="Fristående (föräldrakooperativ)">Föräldrakooperativ</option>
                </select>
                <button className="styled-button" onClick={toggleView}>
                    {view === 'map' ? 'Visa Lista' : 'Visa Karta'}
                </button>
            </div>

            <div ref={mapRef} className={`map-container ${view === 'list' ? 'hidden' : ''}`}></div>

            <div className={`cards-container ${view === 'map' ? 'hidden' : ''}`}>
                {showPlaces && nearbyPlaces.length > 0 ? (
                    nearbyPlaces.map((place) => (
                        <PreschoolCard
                            key={place.id}
                            preschool={place}
                            onSelect={handleCardSelect}
                        />
                    ))
                ) : (
                    <p>Inga förskolor hittades.</p>
                )}
            </div>

            {selectedPlace && (
                <DetailedCard schoolData={selectedPlace} onClose={() => setSelectedPlace(null)} />
            )}
        </div>
    );
};

export default MapComponent;

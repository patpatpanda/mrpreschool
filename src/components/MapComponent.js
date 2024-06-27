import React, { useEffect, useRef, useState, useCallback } from 'react';
import PreschoolCard from './PreschoolCard';
import DetailedCard from './DetailedCard';
import '../styles/GoogleMap.css';
import { fetchPdfDataByName, fetchSchoolDetailsByAddress, fetchNearbySchools } from './api';

/*global google*/

const MapComponent = () => {
    const mapRef = useRef(null);
    const containerRef = useRef(null);
    const [map, setMap] = useState(null);
    const [geocoder, setGeocoder] = useState(null);
    const [infowindow, setInfowindow] = useState(null);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [showPlaces, setShowPlaces] = useState(false);
    const [markers, setMarkers] = useState([]);
    const [directionsService, setDirectionsService] = useState(null);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);

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

            const directionsRenderer = new google.maps.DirectionsRenderer();
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

    useEffect(() => {
        const dragContainer = containerRef.current;
        let startY = 0;
        let startHeight = 0;
        let animationFrameId;

        const onMouseMove = (e) => {
            const newHeight = startHeight - (e.clientY - startY);
            if (newHeight >= 20 && newHeight <= window.innerHeight - 50) {
                dragContainer.style.height = `${newHeight}px`;
            }
        };

        const onTouchMove = (e) => {
            const touch = e.touches[0];
            const newHeight = startHeight - (touch.clientY - startY);
            if (newHeight >= 20 && newHeight <= window.innerHeight - 50) {
                dragContainer.style.height = `${newHeight}px`;
            }
        };

        const onMouseDown = (e) => {
            startY = e.clientY;
            startHeight = dragContainer.getBoundingClientRect().height;

            const moveHandler = (e) => {
                if (animationFrameId) return;
                animationFrameId = requestAnimationFrame(() => {
                    onMouseMove(e);
                    animationFrameId = null;
                });
            };

            document.addEventListener('mousemove', moveHandler);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', moveHandler);
            }, { once: true });
        };

        const onTouchStart = (e) => {
            const touch = e.touches[0];
            startY = touch.clientY;
            startHeight = dragContainer.getBoundingClientRect().height;

            const moveHandler = (e) => {
                if (animationFrameId) return;
                animationFrameId = requestAnimationFrame(() => {
                    onTouchMove(e);
                    animationFrameId = null;
                });
            };

            document.addEventListener('touchmove', moveHandler);
            document.addEventListener('touchend', () => {
                document.removeEventListener('touchmove', moveHandler);
            }, { once: true });
        };

        const dragHandle = dragContainer.querySelector('.drag-handle');
        dragHandle.addEventListener('mousedown', onMouseDown);
        dragHandle.addEventListener('touchstart', onTouchStart);

        return () => {
            dragHandle.removeEventListener('mousedown', onMouseDown);
            dragHandle.removeEventListener('touchstart', onTouchStart);
        };
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
                const originMarker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    icon: {
                        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    },
                });

                console.log("Geocoded location:", results[0].geometry.location);
                findNearbyPlaces(results[0].geometry.location);
                setShowPlaces(true);

                setMarkers((prevMarkers) => [...prevMarkers, originMarker]);
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
        try {
            console.log(`Fetching nearby places for lat: ${location.lat()}, lng: ${location.lng()}`);
            const places = await fetchNearbySchools(location.lat(), location.lng());

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
    }, [map]);

    const createMarker = (place) => {
        const marker = new google.maps.Marker({
            map: map,
            position: { lat: place.latitude, lng: place.longitude },
            title: place.namn
        });

        marker.addListener('click', async () => {
            infowindow.setContent(place.namn);
            infowindow.open(map, marker);

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

            calculateRoute(document.getElementById('address').value.trim(), { lat: place.latitude, lng: place.longitude });
        });

        setMarkers((prevMarkers) => [...prevMarkers, marker]);
    };

    const handleCardSelect = async (data) => {
        const cleanName = data.namn.replace(/^(Förskola\s+|Förskolan\s+)/i, '').trim();
        const pdfData = await fetchPdfDataByName(cleanName);
        const relevantAddress = extractRelevantAddress(data.adress);
        const schoolDetails = await fetchSchoolDetailsByAddress(relevantAddress);

        const detailedPlace = {
            ...data,
            pdfData: pdfData ? pdfData : null,
            schoolDetails: schoolDetails ? schoolDetails : null,
        };

        console.log("Selected place details from card:", detailedPlace);
        setSelectedPlace(detailedPlace);
    };

    const clearMarkers = () => {
        markers.forEach(marker => marker.setMap(null));
        setMarkers([]);
    };

    const calculateRoute = (origin, destination) => {
        const request = {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
        };

        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);
            } else {
                alert('Could not display directions due to: ' + status);
            }
        });
    };

    return (
        <div className="app-container">
            <div ref={mapRef} className="map-container"></div>

            <div className="search-container">
                <input id="address" type="text" className="styled-input" placeholder="Ange Address eller Förskolans Namn" />
                <button className="styled-button" onClick={geocodeAddress}>Hitta Förskolor</button>
            </div>

            <div className="cards-container" id="draggable-container" ref={containerRef}>
                <div className="drag-handle"></div>
                {showPlaces && nearbyPlaces.map((place) => (
                    <PreschoolCard
                        key={place.id}
                        preschool={place}
                        onSelect={handleCardSelect}
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

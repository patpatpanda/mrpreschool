import React, { useEffect, useRef, useState, useCallback } from 'react';
import PreschoolCard from './PreschoolCard';
import DetailedCard from './DetailedCard';
import '../styles/GoogleMap.css';
import { fetchPdfDataByName, fetchSchoolDetailsByAddress, fetchNearbySchools } from './api';
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Container, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import ListIcon from '@mui/icons-material/List';
import MapIcon from '@mui/icons-material/Map';

const MapComponent = () => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [geocoder, setGeocoder] = useState(null);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [showPlaces, setShowPlaces] = useState(false);
    const [currentMarkers, setCurrentMarkers] = useState([]);
    const [originMarker, setOriginMarker] = useState(null);
    const [directionsService, setDirectionsService] = useState(null);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);
    const [filter, setFilter] = useState('alla');
    const [serviceType, setServiceType] = useState('alla');
    const [view, setView] = useState('map'); // Ändra standardvärdet till 'map'
    const [walkingTimes, setWalkingTimes] = useState({});
    const [showText, setShowText] = useState(true); // Ny state för att hantera synlighet av texten

    useEffect(() => {
        const initMap = () => {
            const stockholm = new window.google.maps.LatLng(59.3293, 18.0686);

            const map = new window.google.maps.Map(mapRef.current, {
                center: stockholm,
                zoom: 12,
                disableDefaultUI: true,
            });
            setMap(map);

            const geocoder = new window.google.maps.Geocoder();
            setGeocoder(geocoder);

            const directionsService = new window.google.maps.DirectionsService();
            setDirectionsService(directionsService);

            const directionsRenderer = new window.google.maps.DirectionsRenderer({
                suppressMarkers: true,
                polylineOptions: {
                    strokeColor: '#FF6347', // En tydlig tomatröd färg
                    strokeOpacity: 0.9,
                    strokeWeight: 7, // Linjens tjocklek
                    icons: [
                        {
                            icon: {
                                path: 'M 0,-1 0,1', // Enkel linje
                                strokeOpacity: 1,
                                scale: 4,
                            },
                            offset: '0',
                            repeat: '20px',
                        },
                        {
                            icon: {
                                path: window.google.maps.SymbolPath.CIRCLE,
                                fillColor: '#FF6347',
                                fillOpacity: 1,
                                strokeColor: 'white',
                                strokeWeight: 2,
                                scale: 3,
                            },
                            offset: '0%',
                            repeat: '20px',
                        },
                    ],
                },
            });
            directionsRenderer.setMap(map);
            setDirectionsRenderer(directionsRenderer);

            const infowindow = new window.google.maps.InfoWindow();
            window.infowindow = infowindow;
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

    const handleServiceTypeChange = (event) => {
        setServiceType(event.target.value);
    };

    const findNearbyPlaces = useCallback(async (location) => {
        try {
            const places = await fetchNearbySchools(location.lat(), location.lng(), filter, serviceType);

            if (places.length > 0) {
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
                clearMarkers();
                detailedResults.forEach(result => {
                    createMarker(result, location);
                });
            } else {
                alert('Inga förskolor hittades på den angivna adressen.');
            }
        } catch (error) {
            console.error('Error fetching nearby places:', error);
            alert('Ett fel inträffade vid hämtning av närliggande förskolor.');
        }
    }, [map, filter, serviceType]);

    const geocodeAddress = useCallback(() => {
        const address = document.getElementById('address').value.trim();
        if (!address) {
            alert('Please enter a valid address.');
            return;
        }

        geocoder.geocode({ address: address }, async (results, status) => {
            if (status === 'OK') {
                map.setCenter(results[0].geometry.location);
                map.setZoom(15); // Justera zoomnivån här

                if (originMarker) {
                    originMarker.setMap(null);
                }

                const marker = new window.google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    icon: {
                        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    },
                });

                setOriginMarker(marker);

                findNearbyPlaces(results[0].geometry.location);
                setShowPlaces(true);
                setShowText(false); // Dölj texten när en sökning görs
            } else {
                alert('Search was not successful for the following reason: ' + status);
            }
        });
    }, [geocoder, map, originMarker, findNearbyPlaces]);

    const extractRelevantAddress = (fullAddress) => {
        const addressParts = fullAddress.split(',');
        return addressParts[0].trim();
    };

    const createMarker = (place, originLocation) => {
        const marker = new window.google.maps.Marker({
            map: map,
            position: { lat: place.latitude, lng: place.longitude },
            title: place.namn
        });

        marker.addListener('click', () => {
            map.setZoom(15);
            map.setCenter(marker.getPosition());
            calculateRoute(originLocation, { lat: place.latitude, lng: place.longitude }, place, marker);
        });

        setCurrentMarkers((prevMarkers) => [...prevMarkers, marker]);
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

    const calculateRoute = (origin, destination, place, marker) => {
        const request = {
            origin: origin,
            destination: destination,
            travelMode: window.google.maps.TravelMode.WALKING,
        };

        directionsService.route(request, (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);
                const route = result.routes[0];
                const duration = route.legs[0].duration.text;
                setWalkingTimes((prevTimes) => ({
                    ...prevTimes,
                    [place.id]: duration,
                }));
                window.infowindow.setContent(`${place.namn}<br>Gångtid: ${duration}<br><button id="more-info-btn">Läs mer</button>`);
                window.infowindow.open(map, marker);
                window.google.maps.event.addListenerOnce(window.infowindow, 'domready', () => {
                    document.getElementById('more-info-btn').addEventListener('click', () => {
                        selectPlace(place, true);
                    });
                });
            } else {
                console.error('Could not display directions due to: ' + status);
            }
        });
    };

    const toggleView = () => {
        setView(view === 'map' ? 'list' : 'map');
    };

    const filterAndSortPreschools = (places, origin) => {
        const filteredPlaces = places.filter(place => {
            const distance = calculateDistance(origin, new window.google.maps.LatLng(place.latitude, place.longitude));
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
        clearMarkers();
        topPlaces.forEach(result => {
            createMarker(result, originMarker.getPosition());
        });
    };

    const calculateDistance = (origin, destination) => {
        const R = 6371; // Radius of the Earth in km
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
                        <TextField
                            id="address"
                            variant="outlined"
                            placeholder="Ange Address eller Förskolans Namn"
                            fullWidth
                            sx={{ backgroundColor: 'white', color: 'black' }}
                            InputProps={{
                                style: { color: 'black' },
                                endAdornment: (
                                    <Button onClick={geocodeAddress} variant="contained" color="primary" startIcon={<SearchIcon />}>
                                        Sök
                                    </Button>
                                ),
                            }}
                        />
                        <FormControl fullWidth sx={{ backgroundColor: 'white' }}>
                            <InputLabel sx={{ color: 'black', marginTop: '8px' }}>Organisationsform</InputLabel>
                            <Select
                                value={filter}
                                onChange={handleFilterChange}
                                sx={{ color: 'black' }}
                            >
                                <MenuItem value="alla">Alla</MenuItem>
                                <MenuItem value="Fristående">Fristående</MenuItem>
                                <MenuItem value="Kommunal">Kommunal</MenuItem>
                                <MenuItem value="Fristående (föräldrakooperativ)">Föräldrakooperativ</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{ backgroundColor: 'white' }}>
                            <InputLabel sx={{ color: 'black', marginTop: '8px' }}>Typ Av Service</InputLabel>
                            <Select
                                value={serviceType}
                                onChange={handleServiceTypeChange}
                                sx={{ color: 'black' }}
                            >
                                <MenuItem value="alla">Alla</MenuItem>
                                <MenuItem value="Förskola">Förskola</MenuItem>
                                <MenuItem value="Pedagogisk omsorg">Dagmamma</MenuItem>
                            </Select>
                        </FormControl>

                        <Button onClick={toggleView} variant="contained" color="secondary" startIcon={view === 'map' ? <ListIcon /> : <MapIcon />}>
                            {view === 'map' ? 'Visa Lista' : 'Visa Karta'}
                        </Button>
                        <Button onClick={handleTopRanked} variant="contained" color="secondary">
                            Högst rank
                        </Button>
                    </Box>
                </Container>
            </div>

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
        </div>
    );
};

export default MapComponent;

import React, { useEffect, useRef, useState, useCallback } from 'react';
import PreschoolCard from './PreschoolCard';
import DetailedCard from './DetailedCard';
import '../styles/GoogleMap.css';
import { fetchPdfDataByName, fetchSchoolDetailsByAddress, fetchNearbySchools } from './api';
import { TextField, Button, Select, MenuItem, FormControl, Container, Box, Accordion, AccordionSummary, AccordionDetails, Typography, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ListIcon from '@mui/icons-material/List';
import MapIcon from '@mui/icons-material/Map';
import kommunalMarker from '../images/icons8-children-16.png';
import friskolaMarker from '../images/icons8-children-48.png';

/*global google*/

const MapComponent = () => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [geocoder, setGeocoder] = useState(null);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [showPlaces, setShowPlaces] = useState(false);
    const [currentMarkers, setCurrentMarkers] = useState([]);
    const [originMarker, setOriginMarker] = useState(null);
    const [filter, setFilter] = useState('alla');
    const [serviceType, setServiceType] = useState('alla');
    const [view, setView] = useState('list');
    const [walkingTimes, setWalkingTimes] = useState({});
    const [showText, setShowText] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [loading, setLoading] = useState(false);
    const directionsRendererRef = useRef(null);

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
            loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyCbJmqNnZHTZ99pPQ2uHfkDXwpMxOpfYLw&libraries=places,directions');
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
        } finally {
            setLoading(false);
        }
    }, [map, filter, serviceType]);

    const geocodeAddress = useCallback(() => {
        const address = document.getElementById('address').value.trim();
        if (!address) {
            alert('Please enter a valid address.');
            return;
        }

        setLoading(true);

        geocoder.geocode({ address: address }, async (results, status) => {
            if (status === 'OK') {
                map.setCenter(results[0].geometry.location);
                map.setZoom(17);

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

                await findNearbyPlaces(results[0].geometry.location);
                setShowPlaces(true);
                setShowText(false);
                setView('map');
                setShowFilters(true);
                setExpanded(false);
            } else {
                alert('Search was not successful for the following reason: ' + status);
                setLoading(false);
            }
        });
    }, [geocoder, map, originMarker, findNearbyPlaces]);

    const extractRelevantAddress = (fullAddress) => {
        const addressParts = fullAddress.split(',');
        return addressParts[0].trim();
    };

    const createMarker = (place, originLocation) => {
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

        marker.addListener('click', () => {
            selectPlace(place, true);
            drawRoute(originLocation, { lat: place.latitude, lng: place.longitude });
        });

        setCurrentMarkers((prevMarkers) => [...prevMarkers, marker]);

        calculateWalkingTime(originLocation, { lat: place.latitude, lng: place.longitude }, place, marker);
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

    const clearMarkers = () => {
        currentMarkers.forEach(marker => marker.setMap(null));
        setCurrentMarkers([]);
    };

    const calculateWalkingTime = (origin, destination, place, marker) => {
        const service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
            {
                origins: [origin],
                destinations: [destination],
                travelMode: google.maps.TravelMode.WALKING,
            },
            (response, status) => {
                if (status === google.maps.DistanceMatrixStatus.OK) {
                    const duration = response.rows[0].elements[0].duration.text;
                    setWalkingTimes((prevTimes) => ({
                        ...prevTimes,
                        [place.id]: duration,
                    }));
                    const contentString = `
                      <div style="font-size: 12px; max-height: 150px; overflow-y: auto;">
                        <strong>${place.namn}</strong><br>
                        Helhetsomdöme: ${place.pdfData ? place.pdfData.helhetsomdome : 'N/A'} %<br>
                        Gångtid: ${duration}
                      </div>
                    `;
                    const infowindow = new google.maps.InfoWindow({
                        content: contentString
                    });
                    infowindow.open(map, marker);
                } else {
                    console.error('Could not calculate walking time due to: ' + status);
                }
            }
        );
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
        clearMarkers();
        topPlaces.forEach(result => {
            createMarker(result, originMarker.getPosition());
        });
        setExpanded(false);
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
        clearMarkers();
        closestPlaces.forEach(result => {
            createMarker(result, originMarker.getPosition());
        });
        setExpanded(false);
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

    const drawRoute = (origin, destination) => {
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
        }

        const directionsService = new google.maps.DirectionsService();
        const newDirectionsRenderer = new google.maps.DirectionsRenderer();
        newDirectionsRenderer.setMap(map);

        directionsService.route(
            {
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.WALKING,
            },
            (response, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    newDirectionsRenderer.setDirections(response);
                } else {
                    console.error('Directions request failed due to ' + status);
                }
            }
        );

        directionsRendererRef.current = newDirectionsRenderer;
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
                        {showFilters && (
                            <>
                                <Box display="flex" justifyContent="center" width="100%" gap={2} mt={2}>
                                    <Button onClick={filterClosestPreschools} variant="contained" color="secondary">
                                        Närmsta 5
                                    </Button>
                                    <Button onClick={handleTopRanked} variant="contained" color="secondary">
                                        Högst rank
                                    </Button>
                                </Box>
                                <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)} sx={{ width: '100%', backgroundColor: 'white' }}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                    >
                                        <Typography sx={{ color: 'black' }}>Filter</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <FormControl fullWidth sx={{ backgroundColor: 'white', marginBottom: '8px' }}>
                                            <Typography sx={{ marginTop: '16px', color: 'black' }}>Organisationsform</Typography>
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
                                        <FormControl fullWidth sx={{ backgroundColor: 'white', marginBottom: '8px' }}>
                                            <Typography sx={{ marginTop: '16px', color: 'black' }}>Typ Av Service</Typography>
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
                                    </AccordionDetails>
                                </Accordion>
                            </>
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
                                    <Button onClick={geocodeAddress} variant="contained" color="primary" startIcon={<SearchIcon />}>
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
        </div>
    );
};

export default MapComponent;

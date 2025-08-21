import React, { useState, memo } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBOH_eDOaDrvYnkPqwju6GnMwnhx7X597o';
const libraries = ['places'];

const AutocompleteComponent = ({ onPlaceSelect }) => {
    const [autocomplete, setAutocomplete] = useState(null);

    const onLoad = (autocompleteInstance) => {
        setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place && place.place_id) {
                onPlaceSelect({
                    address: place.formatted_address,
                    placeId: place.place_id,
                });
            }
        }
    };

    return (
        <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            bounds={new window.google.maps.LatLngBounds(
                new window.google.maps.LatLng(-27.5, -58.9),
                new window.google.maps.LatLng(-27.4, -58.7)
            )}
            options={{
                strictBounds: false,
            }}
        >
            <input
              type="text"
              placeholder="Empezá a escribir tu calle y número..."
              className="address-input-style"
            />
        </Autocomplete>
    );
};

const AddressAutocomplete = ({ onPlaceSelect }) => {
    const isGoogleMapsScriptLoaded = window.google && window.google.maps;

    if (isGoogleMapsScriptLoaded) {
        return <AutocompleteComponent onPlaceSelect={onPlaceSelect} />;
    }

    return (
        <LoadScript
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            libraries={libraries}
            loadingElement={<div>Cargando...</div>}
        >
            <AutocompleteComponent onPlaceSelect={onPlaceSelect} />
        </LoadScript>
    );
};

export default memo(AddressAutocomplete);

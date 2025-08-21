import React, { useState, memo } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBOH_eDOaDrvYnkPqwju6GnMwnhx7X597o';
const libraries = ['places'];

// This is the component that will render the Google Maps Autocomplete input.
const AddressAutocomplete = ({ onPlaceSelect }) => {
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
              className="address-input-style" // We'll style this to match your form
            />
        </Autocomplete>
    );
};


// The main exported component that loads the script first.
const AddressAutocompleteWrapper = ({ onPlaceSelect }) => {
    return (
        <LoadScript
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            libraries={libraries}
        >
            <AddressAutocomplete onPlaceSelect={onPlaceSelect} />
        </LoadScript>
    );
};

export default memo(AddressAutocompleteWrapper);
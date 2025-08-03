import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, X, Check } from 'lucide-react';

const AddressMap = ({ onAddressSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Initialize Google Maps
    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      // Load Google Maps API
      loadGoogleMapsAPI();
    }
  }, []);

  const loadGoogleMapsAPI = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    // Default to Mumbai, India
    const defaultLocation = { lat: 19.0760, lng: 72.8777 };
    
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Add click listener to map
    mapInstance.current.addListener('click', handleMapClick);

    // Add search box
    const searchBox = new window.google.maps.places.SearchBox(
      document.getElementById('map-search-input')
    );

    // Bias search results to current map viewport
    mapInstance.current.addListener('bounds_changed', () => {
      searchBox.setBounds(mapInstance.current.getBounds());
    });

    // Handle search results
    searchBox.addListener('places_changed', handleSearchResults);
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    // Reverse geocode to get address
    reverseGeocode(lat, lng);
    
    // Update marker
    updateMarker(lat, lng);
  };

  const handleSearchResults = () => {
    const places = document.getElementById('map-search-input').getAttribute('data-places');
    if (places && places.length > 0) {
      const place = places[0];
      if (place.geometry) {
        mapInstance.current.setCenter(place.geometry.location);
        mapInstance.current.setZoom(15);
        
        // Update marker
        updateMarker(
          place.geometry.location.lat(),
          place.geometry.location.lng()
        );
        
        // Set selected address
        const address = parsePlaceToAddress(place);
        setSelectedAddress(address);
      }
    }
  };

  const reverseGeocode = async (lat, lng) => {
    setLoading(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      
      if (response.results[0]) {
        const address = parseGeocodeResult(response.results[0]);
        setSelectedAddress(address);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMarker = (lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    
    markerRef.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstance.current,
      animation: window.google.maps.Animation.DROP
    });
  };

  const parseGeocodeResult = (result) => {
    const addressComponents = result.address_components;
    const address = {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    };

    addressComponents.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number') || types.includes('route')) {
        address.street += component.long_name + ' ';
      }
      if (types.includes('locality')) {
        address.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        address.state = component.long_name;
      }
      if (types.includes('postal_code')) {
        address.zipCode = component.long_name;
      }
      if (types.includes('country')) {
        address.country = component.long_name;
      }
    });

    address.street = address.street.trim();
    return address;
  };

  const parsePlaceToAddress = (place) => {
    const addressComponents = place.address_components;
    const address = {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    };

    addressComponents.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number') || types.includes('route')) {
        address.street += component.long_name + ' ';
      }
      if (types.includes('locality')) {
        address.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        address.state = component.long_name;
      }
      if (types.includes('postal_code')) {
        address.zipCode = component.long_name;
      }
      if (types.includes('country')) {
        address.country = component.long_name;
      }
    });

    address.street = address.street.trim();
    return address;
  };

  const handleConfirmAddress = () => {
    if (selectedAddress) {
      onAddressSelect(selectedAddress);
    }
  };

  const handleManualSearch = () => {
    if (!searchQuery.trim()) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        mapInstance.current.setCenter(location);
        mapInstance.current.setZoom(15);
        
        updateMarker(location.lat(), location.lng());
        
        const address = parseGeocodeResult(results[0]);
        setSelectedAddress(address);
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Select Address from Map</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="map-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for an address..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
              />
            </div>
            <button
              onClick={handleManualSearch}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative">
          <div
            ref={mapRef}
            className="w-full h-96"
            style={{ minHeight: '400px' }}
          />
          
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-700">Getting address...</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Address */}
        {selectedAddress && (
          <div className="p-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Selected Address:</h4>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                {selectedAddress.street && `${selectedAddress.street}, `}
                {selectedAddress.city && `${selectedAddress.city}, `}
                {selectedAddress.state && `${selectedAddress.state}, `}
                {selectedAddress.zipCode && `${selectedAddress.zipCode}, `}
                {selectedAddress.country}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddress}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="h-4 w-4 mr-2" />
                Use This Address
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!selectedAddress && (
          <div className="p-4 border-t">
            <div className="text-center text-gray-600">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>Click on the map or search for an address to select your location</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AddressMap; 
import Config from 'react-native-config';

const mapboxClient = require('@mapbox/mapbox-sdk');
const mapboxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const baseClient = mapboxClient({ accessToken: Config.MAPBOX_ACCESS_TOKEN });
const geocodingService = mapboxGeocoding(baseClient);

export const geocodeCityInput = async ({ City: city, State: state = '' }) => geocodingService.forwardGeocode({
  query: `${city} ${state}`,
  limit: 1,
}).send();

export default {
  geocodeCityInput,
};

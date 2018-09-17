import Config from 'react-native-config';

const mapboxClient = require('@mapbox/mapbox-sdk');
const mapboxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const baseClient = mapboxClient({ accessToken: Config.MAPBOX_ACCESS_TOKEN });
const geocodingService = mapboxGeocoding(baseClient);

export const geocodeCityInput = async ({ City, State = '' }) => geocodingService.forwardGeocode({
  query: `${City} ${State}`,
  limit: 1,
}).send();

export default {
  geocodeCityInput,
};

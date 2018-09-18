import Config from 'react-native-config';

const mapboxClient = require('@mapbox/mapbox-sdk');
const mapboxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const baseClient = mapboxClient({ accessToken: Config.MAPBOX_ACCESS_TOKEN });
const geocodingService = mapboxGeocoding(baseClient);

export const geocodeCityInput = async ({ City, State = '' }) => {
  // the geocoder does not respond well to `d. c.` as the state
  if (State === 'd. c.') {
    State = 'dc'
  }

  return geocodingService.forwardGeocode({
    query: `${City} ${State}`,
    types: ['country', 'region', 'district', 'place'],
  }).send();
};

export default {
  geocodeCityInput,
};

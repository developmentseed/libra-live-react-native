import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

import MapboxGL from '@mapbox/react-native-mapbox-gl';
import moment from 'moment';
import queryString from 'query-string';
import Config from 'react-native-config';

const bandCombinations = {
  natural: 'red,green,blue',
  vegetationHealth: 'nir,swir16,blue',
  landWater: 'nir,swir16,red',
  // { label: 'Natural Color (actual RGB)', value: 'red,green,blue' },
  // { label: 'False Color (urban)', value: 'swir22,swir16,red' },
  // { label: 'Agriculture', value: 'nir,red,green' },
  // { label: 'Atmospheric Penetration', value: 'swir22,swir16,nir' },
  // { label: 'Healthy Vegetation', value: 'nir,swir16,blue' },
  // { label: 'Land/Water', value: 'nir,swir16,red' },
  // { label: 'Natural With Atmospheric Removal', value: 'swir22,nir,green' },
  // { label: 'Vegetation Analysis', value: 'swir16,nir,red' }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: '100%',
  },
});

export default class MapScreen extends Component {
  constructor(props) {
    super(props);

    const { navigation } = this.props;
    const centerCoords = navigation.getParam('centerCoords', null);
    const lexSlotValues = navigation.getParam('lexSlotValues', {});

    this.state = {
      centerCoords,
      lexSlotValues,
      tileQueryString: '',
    };
  }

  componentDidMount() {
    this.convertLexSlotsToQueryParams();
  }

  convertLexSlotsToQueryParams() {
    const { lexSlotValues } = this.state;
    const tileQueryParams = {};

    const startDate = lexSlotValues.Date || '1960-01-01';
    const endDate = moment().format('YYYY-MM-DD');
    tileQueryParams.datetime = `${startDate}/${endDate}`;

    if (lexSlotValues.CloudPercentage) {
      tileQueryParams['eo:coverage'] = lexSlotValues.CloudPercentage;
    }

    const bandType = 'natural';
    tileQueryParams['eo:bands'] = bandCombinations[bandType];

    this.setState({
      tileQueryString: queryString.stringify(tileQueryParams),
    });
  }

  renderRasterLayer() {
    const { tileQueryString } = this.state;
    if (!tileQueryString) {
      return null;
    }
    return (
      <MapboxGL.RasterSource
        id="sat"
        tileSize={256}
        url={`${Config.TILER_URL}?${tileQueryString}`}
      >
        <MapboxGL.RasterLayer
          id="satLayer"
          sourceID="sat"
        />
      </MapboxGL.RasterSource>
    );
  }

  render() {
    const { centerCoords } = this.state;

    return (
      <View style={styles.container}>
        { centerCoords && (
          <MapboxGL.MapView
            styleURL={Config.MAPBOX_STYLE_URL}
            zoomLevel={12}
            centerCoordinate={centerCoords}
            style={styles.map}
          >
            {this.renderRasterLayer()}
          </MapboxGL.MapView>
        ) }
      </View>
    );
  }
}

MapScreen.propTypes = {
  navigation: PropTypes.shape({
    getParam: PropTypes.func.isRequired,
  }).isRequired,
};

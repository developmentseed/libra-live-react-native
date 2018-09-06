import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

import MapboxGL from '@mapbox/react-native-mapbox-gl';
import Config from 'react-native-config';

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

    this.state = {
      centerCoords,
    };
  }

  render() {
    const { centerCoords } = this.state;

    return (
      <View style={styles.container}>
        { centerCoords && (
          <MapboxGL.MapView
            styleURL={MapboxGL.StyleURL.Street}
            zoomLevel={12}
            centerCoordinate={centerCoords}
            style={styles.map}
          >
            <MapboxGL.RasterSource
              id="sat"
              tileSize={256}
              url={Config.TILER_URL}
            >
              <MapboxGL.RasterLayer
                id="satLayer"
                sourceID="sat"
              />
            </MapboxGL.RasterSource>
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

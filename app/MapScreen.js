import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

import MapboxGL from '@mapbox/react-native-mapbox-gl';

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
          />
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

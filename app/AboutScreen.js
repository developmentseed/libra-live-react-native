import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const colorWhite = '#fff';
const colorBlack = '#000';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorBlack,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});

export default class AboutScreen extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <View style={styles.container}>

      </View>
    );
  }
}

AboutScreen.propTypes = {
  navigation: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

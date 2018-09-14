import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  Platform,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import PropTypes from 'prop-types';

import { AudioRecorder, AudioUtils } from 'react-native-audio';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import moment from 'moment';
import queryString from 'query-string';
import Config from 'react-native-config';

import { geocodeCityInput } from './services/geocoding';
import { sendAudioToLex } from './services/lex';

import MicrophoneIcon from './components/MicrophoneIcon';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const bandCombinations = {
  natural: 'B4,B3,B2',
  vegetationHealth: 'B5,B6,B2',
  landWater: 'B5,B6,B4',
};

const colorWhite = '#fff';
const colorBlack = '#000';
const micInactiveShadow = '#4AE2D6';
const micActiveShadow = '#CD50E7';

const inactiveShadowRadius = 10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  microphoneButton: {
    position: 'absolute',
    bottom: 40,
    right: screenWidth / 2 - 40,
  },
  buttonContainer: {
    backgroundColor: colorWhite,
    borderRadius: 64,
    width: 80,
    height: 80,
    alignItems: 'center',
    elevation: 1,
    padding: 1,
    paddingTop: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
  },
});

export default class MapScreen extends Component {
  constructor(props) {
    super(props);

    const { navigation } = this.props;
    const centerCoords = navigation.getParam('centerCoords', [
      -77.0368707,
      38.9071923,
    ]);
    const lexSlotValues = navigation.getParam('lexSlotValues', {});

    this.state = {
      centerCoords,
      lexSlotValues,
      tileQueryString: `eo:bands=${bandCombinations.natural}`,
      isAuthorized: false,
      isRecording: false,
      animatedShadowRadius: new Animated.Value(inactiveShadowRadius),
      errorMessage: null,
    };
  }

  componentDidMount() {
    // TODO: may need to move next line
    this.convertLexSlotsToQueryParams();

    AudioRecorder.requestAuthorization().then((isAuthorized) => {
      this.setState({ isAuthorized });
    });

    this.prepareRecordingAnimation();
    this.prepareRecorder();
  }

  setErrorMessage(message) {
    this.setState({
      errorMessage: message,
    });
  }

  onAudioRecordingFinished = async (data) => {
    // Android callback comes in the form of a promise instead.
    if (Platform.OS === 'ios') {
      this.finishRecording(data.audioFileURL);
    }

    const { isRecording } = this.state;

    if (isRecording) {
      return;
    }

    const errorMessage = 'Sorry, we didn\'t understand that. Please try again';

    if (!data.base64) {
      console.log('!data.base64?');
      this.setState({
        statusMessage: errorMessage,
      });
      return;
    }

    let feature;
    let lexResponse;

    try {
      lexResponse = await sendAudioToLex(data);
      console.log(lexResponse);
      const geoResponse = await geocodeCityInput(lexResponse.slots.City);
      [feature] = geoResponse.body.features;
    } catch (err) {
      console.log(err);
      if (lexResponse && lexResponse.dialogState === 'ElicitIntent') {
        this.setErrorMessage(lexResponse.message);
      } else {
        this.setErrorMessage(errorMessage);
      }
      return;
    }

    this.showMapView(feature, lexResponse.slots);
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

    let bandType = 'natural';
    if (lexSlotValues.VegetationHealth) {
      bandType = 'vegetationHealth';
    } else if (lexSlotValues.LandWaterAnalysis) {
      bandType = 'landWater';
    }
    tileQueryParams['eo:bands'] = bandCombinations[bandType];

    this.setState({
      tileQueryString: queryString.stringify(tileQueryParams),
    });
  }

  finishRecording(filePath) {
    this.setState({
      isRecording: false,
    });
    console.log(`Finished recording at path: ${filePath}`);
  }

  prepareRecorder() {
    const audioPath = `${AudioUtils.DocumentDirectoryPath}/test2.lpcm`;
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 8000,
      Channels: 1,
      AudioQuality: 'High',
      AudioEncoding: 'lpcm',
      IncludeBase64: true,
    });

    AudioRecorder.onFinished = this.onAudioRecordingFinished;
  }

  prepareRecordingAnimation() {
    const { animatedShadowRadius } = this.state;

    const animatedRadiusValues = [5, 10, 15, 8, 12, 18, 10, 7];
    const animations = animatedRadiusValues.map(radiusValue => Animated.timing(
      animatedShadowRadius,
      {
        toValue: radiusValue,
        duration: 200,
        useNativeDriver: true,
      },
    ));

    this.recordingAnimation = Animated.loop(Animated.sequence(animations));
  }

  showMapView(feature, lexSlotValues) {
    const { navigation } = this.props;

    this.setState({
      centerCoords: feature.geometry.coordinates,
      lexSlotValues,
    });
  }

  async startRecording() {
    const { isAuthorized } = this.state;
    if (!isAuthorized) {
      return;
    }

    console.log('startRecording');
    this.recordingAnimation.start();

    this.setState({
      isRecording: true,
      statusMessage: null,
    });

    try {
      await AudioRecorder.startRecording();
    } catch (error) {
      console.error(error);
    }
  }

  async stopRecording() {
    this.stopRecordingAnimation();

    try {
      const filePath = await AudioRecorder.stopRecording();

      if (Platform.OS === 'android') {
        this.finishRecording(filePath);
      }
    } catch (error) {
      console.error(error);
    }
  }

  stopRecordingAnimation() {
    const { animatedShadowRadius } = this.state;

    const resetButtonShadow = Animated.timing(
      animatedShadowRadius,
      {
        toValue: inactiveShadowRadius,
        duration: 200,
        useNativeDriver: true,
      },
    );

    this.recordingAnimation.stop();
    this.recordingAnimation.reset();
    resetButtonShadow.start();
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
          belowLayerID="waterway-label"
        />
      </MapboxGL.RasterSource>
    );
  }

  render() {
    console.log('MapScreen render state', this.state);
    const {
      centerCoords,
      animatedShadowRadius,
      isRecording,
      errorMessage,
    } = this.state;

    return (
      <View style={styles.container}>
        { centerCoords && (
          <MapboxGL.MapView
            styleURL={Config.MAPBOX_STYLE_URL}
            zoomLevel={10}
            centerCoordinate={centerCoords}
            style={styles.map}
          >
            {this.renderRasterLayer()}
            <TouchableOpacity
              style={[styles.microphoneButton]}
              onPress={() => {
                if (isRecording) {
                  this.stopRecording();
                } else {
                  this.startRecording();
                }
              }}
            >
              <Animated.View
                style={[styles.buttonContainer, {
                  shadowColor: isRecording ? micActiveShadow : micInactiveShadow,
                  shadowRadius: animatedShadowRadius,
                }]}
              >
                <MicrophoneIcon width={38} height={65} />
              </Animated.View>
            </TouchableOpacity>
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

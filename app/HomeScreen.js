import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Button,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';

import { AudioRecorder, AudioUtils } from 'react-native-audio';

// import MicrophoneIcon from './app/components/MicrophoneIcon';

import { geocodeCityInput } from './services/geocoding';
import { sendAudioToLex } from './services/lex';

const colorWhite = '#fff';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthorized: false,
      isRecording: false,
    };
  }

  componentDidMount() {
    AudioRecorder.requestAuthorization().then((isAuthorized) => {
      this.setState({ isAuthorized });
    });

    this.prepareRecorder();
  }

  finishRecording(filePath) {
    this.setState({
      isRecording: false,
    });
    console.log(`Finished recording at path: ${filePath}`);
  }

  prepareRecorder() {
    const audioPath = `${AudioUtils.DocumentDirectoryPath}/test.lpcm`;
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 8000,
      Channels: 1,
      AudioQuality: 'High',
      AudioEncoding: 'lpcm',
      IncludeBase64: true,
    });

    AudioRecorder.onFinished = async (data) => {
      // Android callback comes in the form of a promise instead.
      if (Platform.OS === 'ios') {
        this.finishRecording(data.audioFileURL);
      }

      if (data.base64) {
        const feature = await this.processSpeechInput(data);
        this.showMapView(feature);
      }
    };
  }

  async processSpeechInput(audioData) {
    const { isRecording } = this.state;
    if (isRecording) {
      return;
    }

    let feature;
    try {
      const lexResponse = await sendAudioToLex(audioData);
      console.log(lexResponse);
      // const geoResponse = await geocodeCityInput(lexResponse.slots.City);
      const geoResponse = await geocodeCityInput('San Francisco');
      [feature] = geoResponse.body.features;
    } catch (err) {
      console.error(err);
    }

    return feature;
  }

  showMapView(feature) {
    if (!feature) {
      // Show a message that location could not be found?
      return;
    }

    const { navigation } = this.props;

    navigation.push('Map', {
      centerCoords: feature.geometry.coordinates,
    });
  }

  async startRecording() {
    const { isAuthorized } = this.state;
    if (!isAuthorized) {
      return;
    }

    this.setState({
      isRecording: true,
    });

    try {
      await AudioRecorder.startRecording();
    } catch (error) {
      console.error(error);
    }
  }

  async stopRecording() {
    try {
      const filePath = await AudioRecorder.stopRecording();

      if (Platform.OS === 'android') {
        this.finishRecording(filePath);
      }
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    const { isRecording } = this.state;

    return (
      <View style={styles.container}>
        <Button
          onPress={() => {
            if (isRecording) {
              this.stopRecording();
            } else {
              this.startRecording();
            }
          }}
          title={`${isRecording ? 'Stop' : 'Start'} recording`}
        />
        {/* <MicrophoneIcon width={100} height={100} /> */}
      </View>
    );
  }
}

HomeScreen.propTypes = {
  navigation: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

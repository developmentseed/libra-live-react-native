import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Button,
  Platform,
  Text,
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
    AudioRecorder.checkAuthorizationStatus().then((isAuthorized) => {
      console.log(isAuthorized);
      this.setState({ isAuthorized });

      if (isAuthorized) {
        this.prepareRecorder();
      }
    });
  }

  onAudioRecordingFinished = async (data) => {
    // Android callback comes in the form of a promise instead.
    if (Platform.OS === 'ios') {
      this.finishRecording(data.audioFileURL);
    }

    const { isRecording } = this.state;

    if (!isRecording && data.base64) {
      let feature;
      let lexResponse;

      try {
        lexResponse = await sendAudioToLex(data);
        console.log(lexResponse);

        if (lexResponse.dialogState === 'ElicitIntent' || !lexResponse.slots) {
          this.setStatusMessage(lexResponse.message);
          return;
        }

        const geoResponse = await geocodeCityInput(lexResponse.slots.City);
        // const geoResponse = await geocodeCityInput('San Francisco');
        [feature] = geoResponse.body.features;
      } catch (err) {
        console.error(err);
      }

      this.showMapView(feature, lexResponse.slots);
      // this.showMapView(feature, {
      //   CloudPercentage: 0,
      // });
    }
  }

  setStatusMessage(message) {
    this.setState({
      statusMessage: message,
    });
  }

  finishRecording(filePath) {
    this.setState({
      isRecording: false,
    });
    console.log(`Finished recording at path: ${filePath}`);
  }

  async prepareRecorder() {
    const audioPath = `${AudioUtils.DocumentDirectoryPath}/test.lpcm`;

    try {
      await AudioRecorder.prepareRecordingAtPath(audioPath, {
        SampleRate: 8000,
        Channels: 1,
        AudioQuality: 'High',
        AudioEncoding: 'lpcm',
        // AudioEncoding: 'aac',
        IncludeBase64: true,
      });
    } catch (err) {
      console.log(err);
    }

    AudioRecorder.onFinished = this.onAudioRecordingFinished;
  }

  showMapView(feature, lexSlotValues) {
    if (!feature) {
      // Show a message that location could not be found?
      return;
    }

    const { navigation } = this.props;

    navigation.push('Map', {
      centerCoords: feature.geometry.coordinates,
      lexSlotValues,
    });
  }

  async startRecording() {
    const { isAuthorized } = this.state;
    if (!isAuthorized) {
      return;
    }

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
    const { isRecording, statusMessage } = this.state;

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
        { statusMessage && (
          <Text>{ statusMessage }</Text>
        )}
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

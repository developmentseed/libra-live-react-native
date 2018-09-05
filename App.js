import React from 'react';
import {
  StyleSheet,
  View,
  Button,
  Platform,
} from 'react-native';

import { AudioRecorder, AudioUtils } from 'react-native-audio';
import Config from 'react-native-config';

import AWS from 'aws-sdk/dist/aws-sdk-react-native';

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: Config.AWS_COGNITO_IDENTITY_POOL_ID,
});

// import MicrophoneIcon from './app/components/MicrophoneIcon';

const { Buffer } = require('buffer');

const colorWhite = '#fff';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default class App extends React.Component {
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
  }

  async startRecording() {
    const { isAuthorized } = this.state;
    if (!isAuthorized) {
      return;
    }

    this.setState({
      isRecording: true,
    });

    const audioPath = `${AudioUtils.DocumentDirectoryPath}/test.lpcm`;
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 8000,
      Channels: 1,
      AudioQuality: 'High',
      AudioEncoding: 'lpcm',
      IncludeBase64: true,
    });

    AudioRecorder.onFinished = (data) => {
      // Android callback comes in the form of a promise instead.
      if (Platform.OS === 'ios') {
        this.finishRecording(data.audioFileURL);
      }

      if (data.base64) {
        this.sendToLex(data);
      }
    };

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

  sendToLex(audioData) {
    const { isRecording } = this.state;
    if (isRecording) {
      return;
    }

    const lexRuntime = new AWS.LexRuntime();

    const audioBuffer = Buffer.from(audioData.base64, 'base64');
    if (!audioBuffer) {
      return;
    }

    const params = {
      botAlias: '$LATEST',
      botName: 'LibraLive',
      contentType: 'audio/lpcm; sample-rate=8000; sample-size-bits=16; channel-count=1; is-big-endian=false',
      inputStream: audioBuffer,
      userId: Config.AWS_USER_ID,
      accept: 'text/plain; charset=utf-8',
    };

    lexRuntime.postContent(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        return;
      }

      console.log(data);
    });
  }

  finishRecording(filePath) {
    this.setState({
      isRecording: false,
    });
    console.log(`Finished recording at path: ${filePath}`);
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
          title="Start recording"
        />
        {/* <MicrophoneIcon width={100} height={100} /> */}
      </View>
    );
  }
}

import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View,
  Button, 
  // TouchableHighlight, 
  // Image,
  Platform,
} from 'react-native';

import { AudioRecorder, AudioUtils } from 'react-native-audio';
import AWS from 'aws-sdk/dist/aws-sdk-react-native'

// import MicrophoneIcon from './app/components/MicrophoneIcon';

const Buffer = require('buffer').Buffer;

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthorized: false,
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

    const audioPath = AudioUtils.DocumentDirectoryPath + '/test.lpcm';
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
      const filePath = await AudioRecorder.startRecording();
      // arbitrarily stop recording after 1.5 seconds
      setTimeout(this.stopRecording, 2000);
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

      return filePath;
    } catch (error) {
      console.error(error);
    }    
  }

  async sendToLex(audioData) {
    const lexruntime = new AWS.LexRuntime({
      region: 'us-east-1',
    });

    const audioBuffer = Buffer.from(audioData.base64, 'base64');
    if (!audioBuffer) {
      return;
    }

    const params = {
      botAlias: '$LATEST', 
      botName: 'LibraLive',
      contentType: 'audio/lpcm; sample-rate=8000; sample-size-bits=16; channel-count=1; is-big-endian=false',
      inputStream: audioBuffer,
      userId: 'markboyd',
      accept: 'text/plain; charset=utf-8',
    };      

    lexruntime.postContent(params, (err, data) => {
      if (err) {
        console.log(err, err.stack); 
        return;
      }

      console.log(data);           
    });      
  }

  finishRecording(filePath) {
    console.log(`Finished recording at path: ${filePath}`);
  }  

  render() {
    return (
      <View style={styles.container}>
        <Button 
          onPress={() => this.startRecording()}
          title="Start recording"
        >          
        </Button>
        <Button 
          onPress={() => this.stopRecording()}
          title="Stop recording"
        >          
        </Button>        
        {/* <MicrophoneIcon width={100} height={100} /> */}
        {/* <Text style={styles.text}>Press the microphone to search for a satellite image of a location.</Text> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    // color: '#fff',
  },
});

import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

import SoundRecorder from 'react-native-sound-recorder';

export default class App extends React.Component {
  record() {    
    SoundRecorder.start(SoundRecorder.PATH_CACHE + '/test.mp4')
      .then(function() {
        console.log('started recording');
        setTimeout(() => {
          SoundRecorder.stop()
            .then(function(result) {
              console.log('stopped recording, audio file saved at: ' + result.path);
            });          
        }, 2000);
      });      
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <Text>Changes you make will automatically reload.</Text>
        <Text>Shake your phone to open the developer menu.</Text>
        <Button 
          onPress={() => this.record()}
          title="Record"
        >
        </Button>
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
});

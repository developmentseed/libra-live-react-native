import { AppRegistry } from 'react-native';
import Config from 'react-native-config';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import AWS from 'aws-sdk/dist/aws-sdk-react-native';

import App from './App';

MapboxGL.setAccessToken(Config.MAPBOX_ACCESS_TOKEN);

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: Config.AWS_COGNITO_IDENTITY_POOL_ID,
});

console.ignoredYellowBox = ['Remote debugger'];

AppRegistry.registerComponent('libralive', () => App);

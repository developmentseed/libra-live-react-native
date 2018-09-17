import React from 'react';

import { createStackNavigator } from 'react-navigation';

import AboutScreen from './app/AboutScreen';
import MapScreen from './app/MapScreen';

const RootStack = createStackNavigator({
  Map: {
    screen: MapScreen,
  },
  About: {
    screen: AboutScreen,
  },
}, {
  initialRouteName: 'Map',
});

export default function App() {
  return <RootStack />;
}

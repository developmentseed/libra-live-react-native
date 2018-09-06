import React from 'react';

import { createStackNavigator } from 'react-navigation';

import HomeScreen from './app/HomeScreen';
import MapScreen from './app/MapScreen';

const RootStack = createStackNavigator({
  Home: {
    screen: HomeScreen,
  },
  Map: {
    screen: MapScreen,
  },
}, {
  initialRouteName: 'Home',
});

export default function App() {
  return <RootStack />;
}

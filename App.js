import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import NavigationMap from './NavigationMap';

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <NavigationMap
          driverImage={require('./images/car.png')}
          googleMapsApiKey='API_KEY'
          destination={{latitude: 37.771707, longitude: -122.4053769}}
          />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  }
});

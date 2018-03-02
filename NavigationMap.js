import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';

import MapView from 'react-native-maps-with-navigation';
import MapViewDirections from 'react-native-maps-directions';

export default class NavigationMap extends Component {

  constructor(props) {
    super(props);
    this.state = {
      prevPos: null,
      curPos: null,
      rideHasStarted: false,
    }
    this.watchPosition = this.watchPosition.bind(this);
    this.getRotation = this.getRotation.bind(this);
    this.updateMap = this.updateMap.bind(this);
    this.onMapReady = this.onMapReady.bind(this);
    this.startRide = this.startRide.bind(this);
  }

  async componentDidMount() {
    await this.watchPosition();
  }

  async watchPosition() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          'title': 'GPS Permission',
          'message': 'The app needs GPS access to work properly.'
        });
      if (granted !== PermissionsAndroid.RESULTS.GRANTED)
        throw 'GPS Permission Denied!';
      const watchId = navigator.geolocation.watchPosition(pos => {
        const { latitude, longitude } = pos.coords;
        
        const curPos = { latitude, longitude };
        const prevPos = this.state.curPos;

        const curReg = {
          latitude: curPos.latitude,
          longitude: curPos.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };

        const curRot = this.getRotation(prevPos, curPos);

        const curAng = 45;

        this.updateMap(curPos, curReg, curRot, curAng);

        this.setState({ prevPos, curPos });
      }, err => { console.log(err) },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, distanceFilter: 2 });
    } catch (err) { console.log(err); }
  }

  getRotation(prevPos, curPos) {
    if (!prevPos) return 0;
    const xDiff = curPos.latitude - prevPos.latitude;
    const yDiff = curPos.longitude - prevPos.longitude;
    return (Math.atan2(yDiff, xDiff) * 180.0) / Math.PI;
  }
 
  updateMap(pos, reg, rot, ang) {
    if (this.refs.map && this.state.rideHasStarted) {
      this.refs.map.animateToNavigation(pos, rot, ang);
    }
  }

  onMapReady() {
    const padding = 150;
    const opt = { edgePadding: { top: padding, right: padding, bottom: padding, left: padding } };
    this.refs.map.fitToCoordinates([this.state.curPos, this.props.destination], opt);
  }

  startRide() {
    const reg = {
      latitude: this.state.curPos.latitude,
      longitude: this.state.curPos.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    this.refs.map.animateToRegion(reg);
    this.setState({ rideHasStarted: true })
  }

  render() {
    if (!this.state.curPos) return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={this.props.color || "#F54A39"} />
      </View>
    );
    return (
      <View style={styles.flex}>
        <MapView
        ref="map"
        rotateEnabled={!this.state.rideHasStarted}
        scrollEnabled={!this.state.rideHasStarted}
        zoomEnabled={!this.state.rideHasStarted}
        style={[styles.flex, this.props.style]}
        initialRegion={{
          ...this.state.curPos,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        onMapReady={this.onMapReady}
        toolbarEnabled={true}
      >
        <MapView.Marker
          coordinate={this.state.curPos}
          anchor={{ x: 0.5, y: 0.5 }}
          image={this.props.driverImage || null}
        />
        <MapView.Marker
          coordinate={this.props.destination}
          pinColor={this.props.color}
        />
          <MapViewDirections
            origin={this.state.curPos}
            destination={this.props.destination}
            apikey={this.props.googleMapsApiKey}
            strokeWidth={this.props.strokeWidth || 5}
            strokeColor={this.props.color || "#F54A39"}
          />
      </MapView>
      { !this.state.rideHasStarted &&
        <TouchableOpacity
          style={styles.startButton}
          onPress={this.startRide}
          activeOpacity={0.8}>
          <Image
            style={{width: '100%', height: '100%'}}
            source={require('./images/start-icon.png')}
            tintColor={this.props.color || "#F54A39"}
          />
        </TouchableOpacity>
      }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  loading: {
    position: 'absolute',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  startButton: {
    position: 'absolute',
    height: 100,
    width: 100,
    bottom: 15,
    left: 0,
  }
});

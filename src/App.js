import React, { Component } from 'react';

// components
import Form from './Form';
import Mapbox from './Mapbox';

//packages
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      busLat: '', // bus location lat
      busLng: '', // bus location lng
      busLocation: '', // bus location information
      lat: 45.5122, // map center lat
      lng: -122.6587, // map centet lng
      locid: '', // stop ID of what you selected
      nearbyStops: [], // nearby stops ( for the dropdown and Map markers )
    }
    this.onStopSelected = this.onStopSelected.bind(this);
    this.fetchArrivalTimes = this.fetchArrivalTimes.bind(this);
  }

  componentDidMount() {
    this.getLocation();
  }

  getLocation() {
    // Check for gelocation API
    if (navigator.geolocation) {
      // Get Current user location
      // Updating the latitude and longitude in the state
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude }}) => {
          this.setState({
            lat: latitude, 
            lng: longitude
          })
          this.fetchNearbyStops();
        },
        err => {
          console.log(err);
        },
        { maximumAge: 60000, timeout: 90000 }
      );
    }
  }

  fetchNearbyStops() {
    const TRIMET_API_KEY = `${process.env.REACT_APP_TRIMET_KEY}`;
    axios
      .get(`https://developer.trimet.org/ws/V1/stops?json=true&appID=${TRIMET_API_KEY}&ll=${this.state.lat}, ${this.state.lng}&feet=1000`)
      .then(res => {
        this.setState({
          ...this.state,
         nearbyStops: res.data.resultSet.location
        });
      })
      .catch(error => console.log(error)
      )
  }

  fetchArrivalTimes() {
    const TRIMET_API_KEY = `${process.env.REACT_APP_TRIMET_KEY}`;

    axios
      .get(`https://developer.trimet.org/ws/V1/arrivals?locIDs=${this.state.locid}&appID=${TRIMET_API_KEY}&json=true`)
      .then(res => {
        this.setState({
          ...this.setState,
          busLat: res.data.resultSet.arrival[0].blockPosition.lat,
          busLng: res.data.resultSet.arrival[0].blockPosition.lng,
          busLocation: res.data.resultSet.arrival
        });
      })
      .catch(error => console.log(error));
  } 

  onStopSelected(locid) {
    this.setState({
      ...this.setState,
      locid,
    }, () => {
      // Callback for when state is set for selected stop trigger bus position
      this.fetchArrivalTimes();

      if (this.intervalId) {
        window.clearInterval(this.intervalId);
      }

      this.intervalId = setInterval(this.fetchArrivalTimes, 1000 * 5);
    });
  }

  render() {
    const { 
      busLat, 
      busLng, 
      busLocation, 
      lat, 
      lng, 
      locid, 
      nearbyStops, 
    } = this.state;
    console.log(this.state);
    return (
      <>
        <Mapbox 
          busLng={busLng}
          busLat={busLat}
          busLocation={busLocation}
          lat={lat}
          lng={lng}
          locid={locid}
          nearbyStops={nearbyStops}
        />
        <Form 
          busLocation={busLocation}
          fetchArrivalTimes={this.fetchArrivalTimes}
          locid={locid}
          nearbyStops={nearbyStops}
          onStopSelected={this.onStopSelected}
        />
      </>
    );
  }
}

export default App;

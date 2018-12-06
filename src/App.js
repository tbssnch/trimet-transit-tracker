import React, { Component } from 'react';
import axios from 'axios';
import Mapbox from './Mapbox';
import Form from './Form';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      busLat: '', // bus location lat
      busLng: '', // bus location lng
      lat: 45.5122, // map center lat
      lng: -122.6587, // map centet lng
      location: '', // bus location information
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
        console.log(res)
        this.setState({
          ...this.setState,
          location: res.data.resultSet.arrival,
          busLat: res.data.resultSet.arrival[0].blockPosition.lat,
          busLng: res.data.resultSet.arrival[0].blockPosition.lng
        });
      })
      .catch(error => console.log(error)
      )
    } 

  onStopSelected(locid) {
    this.setState({
      ...this.setState,
      locid,
    }, () => {
      // Callback for when state is set for selected stop trigger bus position
      this.intervalId = setInterval(this.fetchArrivalTimes, 1000 * 5);
    });
  }

  render() {
    const { 
      busLat, 
      busLng, 
      busPosition, 
      lat, 
      lng, 
      location, 
      locid, 
      nearbyStops, 
      zoom
    } = this.state;
    return (
      <>
        <Mapbox 
          lat={lat}
          lng={lng}
          location={location}
          nearbyStops={nearbyStops}
          zoom={zoom}
          locid={locid}
          busLat={busLat}
          busLng={busLng}
          busPosition={busPosition}
        />
        <Form 
          location={location}
          nearbyStops={nearbyStops}
          locid={locid}
          onStopSelected={this.onStopSelected}
          fetchArrivalTimes={this.fetchArrivalTimes}
        />
      </>
    );
  }
}

export default App;

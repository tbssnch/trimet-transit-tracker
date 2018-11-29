import React, { Component } from 'react';
import axios from 'axios';
import Mapbox from './Mapbox';
// import Form from './Form';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: -122.6587, // map centet lng
      lat: 45.5122, // map center lat
      zoom: 12.5, // map zoom
      nearbyStops: [], // nearby stops ( for the dropdown and Map markers )
      arrival: [], // excat bus postion of the stop you selected
      locid: '' // stop ID of what you selected
    }
    this.onStopSelected = this.onStopSelected.bind(this);
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

  fetchNearbyStops = () => {
    const TRIMET_API_KEY = `0BD1DE92EE497EA57B0C32698`;

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

  onStopSelected(locid) {
    this.setState({
      locid,
    });
  }

  render() {
    return (
      <>
        <Mapbox 
          lat={this.state.lat}
          lng={this.state.lng}
          location={this.state.location}
          nearbyStops={this.state.nearbyStops}
          zoom={this.state.zoom}
          locid={this.state.locid}
          onStopSelected={this.onStopSelected}
        />
      </>

    );
  }
}


export default App;

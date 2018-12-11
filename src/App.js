import React, { Component } from 'react';
import axios from 'axios';

// components
import Form from './Form';
import Mapbox from './Mapbox';

// packages

const TRIMET_API_KEY = `${process.env.REACT_APP_TRIMET_KEY}`;
const TRIMET_API = 'https://developer.trimet.org/ws/V1/';

function buildTrimetUrl(route) {
  return `${TRIMET_API}${route}`;
}

function buildTrimetQp(additionalQp) {
  return {
    params: {
      ...additionalQp,
      appId: TRIMET_API_KEY,
    },
  };
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      busLocation: [], // bus location information
      lat: 45.5122, // map center lat
      lng: -122.6587, // map centet lng
      nearbyStops: [], // nearby stops ( for the dropdown and Map markers )
    };
    this.onStopSelected = this.onStopSelected.bind(this);
    this.fetchArrivalTimes = this.fetchArrivalTimes.bind(this);
  }

  componentDidMount() {
    this.getLocation();
  }
  
  componentWillUnmount() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  }

  getLocation() {
    // Check for gelocation API
    if (navigator.geolocation) {
      // Get Current user location
      // Updating the latitude and longitude in the state
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          this.setState({
            lat: latitude,
            lng: longitude,
          }, () => {
            this.fetchNearbyStops();
          });
        },
        (err) => {
          console.log(err);
        },
        { maximumAge: 60000, timeout: 90000 },
      );
    }
  }

  fetchNearbyStops() {
    const {
      lat,
      lng,
    } = this.state;

    axios
      .get(
        buildTrimetUrl('stops'),
        buildTrimetQp({
          ll: `${lat}, ${lng}`,
          feet: 1000,
          json: true,
        }),
      )
      .then((res) => {
        this.setState({
          nearbyStops: res.data.resultSet.location,
        });
      })
      .catch(console.log);
  }

  fetchArrivalTimes() {
    const {
      locID,
    } = this.state;

    axios
      .get(
        buildTrimetUrl('arrivals'),
        buildTrimetQp({
          locIDs: locID,
          json: true,
        }),
      )
      .then((res) => {
        this.setState({
          busLocation: res.data.resultSet.arrival,
        });
      })
      .catch(console.log);
  }

  onStopSelected(locID) {
    this.setState({
      locID,
    }, () => {
      this.fetchArrivalTimes();

      if (this.intervalId) {
        window.clearInterval(this.intervalId);
      }

      this.intervalId = setInterval(
        this.fetchArrivalTimes,
        5000,
      );
    });
  }

  render() {
    const {
      busLocation,
      lat,
      lng,
      locID,
      nearbyStops,
    } = this.state;

    return (
      <>
        <Mapbox
          busLocation={busLocation}
          lat={lat}
          lng={lng}
          locID={locID}
          nearbyStops={nearbyStops}
        />
        <Form
          locID={locID}
          nearbyStops={nearbyStops}
          onStopSelected={this.onStopSelected}
        />
      </>
    );
  }
}

export default App;

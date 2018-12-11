import React, { Component } from 'react';

// components
import axios from 'axios';
import Form from './Form';
import Mapbox from './Mapbox';

// packages

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
    };
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
        ({ coords: { latitude, longitude } }) => {
          /*
            type: CRITICAL
            I think this may be where a lot of your issues have been steaming from. setting state is async
            so you cannot depend on the values being updated the way things are written. SetState accepts to arguments,
            the new state and an optional callback which is invoked once state is set. If you invoke fetchNearbyStops in the callback
            you can depend on lat and long being the updated.
            this.setState({
              ...this.state,
              lat: latitude,
              lng: longitude
            }, () => {
              this.fetchNearbyStops();
            })
          */
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
    /*
      type: SUGGESTION
      you can move this to a constant at the top of the file. No need to recompute it each time this function is called
    */
    const TRIMET_API_KEY = `${process.env.REACT_APP_TRIMET_KEY}`;
    axios
      .get(`https://developer.trimet.org/ws/V1/stops?json=true&appID=${TRIMET_API_KEY}&ll=${this.state.lat}, ${this.state.lng}&feet=1000`)
      .then((res) => {
        this.setState({
          ...this.state,
          nearbyStops: res.data.resultSet.location,
        });
      })
      .catch(error => console.log(error));
  }

  fetchArrivalTimes() {
    /*
      type: SUGGESTION
      Again this could be a constant and then you will not be recomputing it.
    */
    const TRIMET_API_KEY = `${process.env.REACT_APP_TRIMET_KEY}`;

    axios
      .get(`https://developer.trimet.org/ws/V1/arrivals?locIDs=${this.state.locid}&appID=${TRIMET_API_KEY}&json=true`)
      .then((res) => {
        /*
          type: CRITICAL
          If I remember correctly sometimes this endpoint does not return block position - if that is true
          you could be accessing a property on undefined. you need to add some type of protection
          const { arrival = [] } = res.data.resultSet;
          const [ { blockPosition } = {} ] = arrival;

          this.setState({
            ...this.state (not setState),
            busLat: blockPosition.lat,
            busLng: blockPosition.lng,
            busLocation: arrival,
          });
        */
        this.setState({
          ...this.setState,
          busLat: res.data.resultSet.arrival[0].blockPosition.lat,
          busLng: res.data.resultSet.arrival[0].blockPosition.lng,
          busLocation: res.data.resultSet.arrival,
        });
      })
      /*
        type: Suggestion
        .catch(conso.log); - will do the same thing without creating an adhoc function.
      */
      .catch(error => console.log(error));
  }

  onStopSelected(locid) {
    this.setState({
      /*
        type: CRITICAL
        do not spread this.setState - spread this.state.
        this.setState({
          ...this.state,
          locid,
        })
      */
      ...this.setState,
      locid,
    }, () => {
      // Callback for when state is set for selected stop trigger bus position
      this.fetchArrivalTimes();

      if (this.intervalId) {
        window.clearInterval(this.intervalId);
      }

      /*
        type: CRITICAL
        you need to clear this interval in `componentWillUnmount`. You do not want to
        update the state of an unmounted component. Technically speaking you never unmount
        this component in the apps lifecycle but it is a very very very habbit to get used to.
        componentWillUnmount() {
          window.clearInterval(this.intervalId);
        }
      */
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
    /*
      type: SUGGESTION
      remove console.log
    */
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

import React, { Component } from 'react';
import Form from './Form';
import busIcon from './assets/stop-icon.png';
import './Mapbox.css';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';


mapboxgl.accessToken = 'pk.eyJ1IjoidGJzc25jaCIsImEiOiJjam9ranIwMjgwNWdqM2tudW1udjhkdTVhIn0._ECcZP3rrCwYmVxMyETD9w';


class Mapbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: -122.6587,
      lat: 45.5122,
      zoom: 12.5,
      location: [],
      arrival: [],
      locid: ''
    }
  }

  componentDidMount() {
    this.getLocation()
    // this.fetchNearbyStops();
    const { lng, lat, zoom,  } = this.state;

    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v8',
      center: [ lng, lat ],
      zoom
    });

    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
          enableHighAccuracy: true
      },
      trackUserLocation: true
  }));

  // this.renderMarkers();
  
  console.log(this.map);
  
}

componentDidUpdate(prevProps, prevState) {
  console.log(this.map);
  if (this.state.lat !== prevState.lat &&
    this.state.lng !== prevState.lng
  ) {
   // When state is updated get nearby stops
    this.fetchNearbyStops();
  }
  this.renderMarkers(this.state.lng, this.state.lat);
  this.renderMarkers();
 

  // this.map.on('click', function() {
    // const self = this;
    
  // });

  }

  renderMarkers = (lng = this.state.lng, lat = this.state.lat) => {
    console.log('renderMarkers', "LAT:" + lat, "LNG" + lng);
    

    
    this.map.loadImage(`${busIcon}`, (error, image) => {
      console.log(this, "this");
      console.log('renderMarkers', "LAT:" + lat, "LNG" + lng);
      console.log(this.state);
      if (error) throw error;
      this.map.addImage('stop', image);
      this.map.addLayer({
          "id": "points",
          "type": "symbol",
          "source": {
              "type": "geojson",
              "data": {
                  "type": "FeatureCollection",
                  "features": [{
                      "type": "Feature",
                      "geometry": {
                          "type": "Point",
                          "coordinates": [this.state.lng, this.state.lat]
                      }
                  }]
              }
          },
          "layout": {
              "icon-image": "stop",
              "icon-size": 0.50,
              "icon-allow-overlap": true
          }
      });
  });
  }


  fetchNearbyStops = () => {
    const TRIMET_API_KEY = `0BD1DE92EE497EA57B0C32698`;
    // const { lat, lng } = this.state;
    axios
      .get(`https://developer.trimet.org/ws/V1/stops?json=true&appID=${TRIMET_API_KEY}&ll=${this.state.lat}, ${this.state.lng}&feet=1000`)
      .then(res => this.setState({
        location: res.data.resultSet.location
      }))
      .catch(error => console.log(error)
      )
  }

  // fetchArrivalTimes = () => {
  //   const TRIMET_API_KEY = `0BD1DE92EE497EA57B0C32698`;
  //   // const { lat, lng } = this.state;
  //   Axios
  //     .get(`https://developer.trimet.org/ws/V1/arrivals?locIDs=${this.state.stopId}&appID=${TRIMET_API_KEY}&json=true`)
  //     .then(res => this.setState({
  //       location: res.data.resultSet.location
  //     }))
  //     .catch(error => console.log(error)
  //     )
  // }




  getLocation = () => {
    console.log("GEOLOCATION")
    // Check for gelocation API
    if (navigator.geolocation) {
      // Get Current user location
      navigator.geolocation.getCurrentPosition(
        // Updating the latitude and longitude in the state
        ({ coords: { latitude, longitude }}) => this.setState({
        lat: latitude, 
        lng: longitude
      })
      ,
      err => console.log(err),
      { maximumAge: 60000, timeout: 5000 }
      );
    }
  }


  render() {
    const { lng, lat, zoom, location } = this.state;
    console.log(this.map);
    console.log(this.props);
    console.log(this.state);
    return(
      <div className="map-container">
        {/* <div className="inline-block absolute top left mt12 ml12 bg-darken75 color-white z1 py6 px12 round-full txt-s txt-bold">
          <div>{`Longitude: ${lng} Latitude: ${lat} Zoom: ${zoom}`}</div>
        </div> */}
        <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />
        <Form location={location} />
      </div>
    );
  }
}

export default Mapbox;

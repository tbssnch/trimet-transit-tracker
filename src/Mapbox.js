import React, { PureComponent } from 'react';
import busIcon from './assets/bus-icon.png';
import stopIcon from './assets/stop-icon.png';


import './Mapbox.css';
import mapboxgl from 'mapbox-gl';
import moment from 'moment';


mapboxgl.accessToken = 'pk.eyJ1IjoidGJzc25jaCIsImEiOiJjam9ranIwMjgwNWdqM2tudW1udjhkdTVhIn0._ECcZP3rrCwYmVxMyETD9w';


class Mapbox extends PureComponent {
  mapContainer = React.createRef();

  componentDidMount() {
    const { lng, lat, zoom } = this.props;

    this.map = new mapboxgl.Map({
      container: this.mapContainer && this.mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v8',
      center: [ lng, lat ],
      zoom: 15,
      // scrollZoom: false
    });

    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
        trackUserLocation: true
    }));

    this.mapIsReadyDeferred = (function() {
      let externalResolve, externalReject;
      const promise = new Promise((resolve, reject) => {
        externalResolve = resolve;
        externalReject = reject;
      });

      return {
        resolve: externalResolve,
        reject: externalReject,
        promise,
      }
    })();

    this.map.on('load', () => {
      this.map.loadImage(`${busIcon}`, (error, image) => {
        if (error) throw error;
        this.map.addImage('bus', image);

        this.map.loadImage(`${stopIcon}`, (error, image) => {
          if (error) throw error;
          this.map.addImage('stop', image);

          if (!this.sourceAdded) {
            this.addSource();
          }
        });
      });
    });
  }


  addSource() {
    this.map.addSource('nearbystops', {
      type: 'geojson',
      data: null,
    });

    this.map.addSource('nearbybus', {
      type:'geojson',
      data: null
    });
    
    this.map.addLayer({
      id: 'nearbystops',
      type: 'symbol',
      maxZoomLevel: 22,
      minZoomLevel: 0,
      source: 'nearbystops',
      paint: {
        'icon-opacity': [
          'case',
          ['boolean', ['feature-state', 'active'], false],
          1,
          0
        ],
        'text-opacity': [
          'case',
          ['boolean', ['feature-state', 'active'], false],
          1,
          0
        ],
      },
      layout: {
        'icon-image': 'stop',
        'icon-size': 0.5,
        'icon-allow-overlap': true,
        'text-field': '{title}',
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-offset': [0, 2],
        'text-anchor': 'top'
      }
    });
    
    this.map.addLayer({
      id: 'nearbybus',
      type: 'symbol',
      source: 'nearbybus',
      paint: {
        'icon-opacity': 1
      },
      layout: {
        'icon-image': 'bus',
        'icon-size': 0.50,
        'icon-allow-overlap': true
      }
    });

    this.sourceAdded = true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.nearbyStops.length) {
      this.renderMarkers(this.props.nearbyStops);
      this.flyToDaStops();
    }
    if (prevProps.locid !== this.props.locid) {
      this.setActiveStop(this.props.locid);
    } 
    if (this.props.location.length) {
      this.renderArrivalMarkers(this.props.location)
    }
  }

  setActiveStop(locid) {
    if (this.previouslySelectedLocid) {
      this.map.setFeatureState({
        source: 'nearbystops', 
        id: this.previouslySelectedLocid
      },
      { 
        active: false 
      });
    }
    this.previouslySelectedLocid = locid;

    this.map.setFeatureState({ 
      source: 'nearbystops', 
      id: this.props.locid,
    }, 
    {
      active: true, 
    });
  }

  setActiveBus(locid) {
    if (this.previouslySelectedLocid) {
      this.map.setFeatureState({
        source: 'nearbystops', 
        id: this.previouslySelectedLocid
      },
      { 
        active: false 
      });
    }
    this.previouslySelectedLocid = locid;

    this.map.setFeatureState({ 
      source: 'nearbystops', 
      id: this.props.locid,
    }, 
    {
      active: true, 
    });
  }
  
  renderMarkers = (nearbyStops) => {
    const FeatureCollection = {
      type: "FeatureCollection",
      features: nearbyStops.map((nearbyStop) => {
        return { 
          id: nearbyStop.locid,
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [
              nearbyStop.lng,
              nearbyStop.lat,
            ]
          },
          properties: {
            title: 'Stop' + ' ' + '#' + nearbyStop.locid,
          },
        };
      })
    };
    
    this.stopsLoaded = true;

    this.mapIsReadyDeferred
      .promise
      .then(() => {
        console.log("STOPS LOAD THE REAL ONE");
      this.map.getSource('nearbystops').setData(FeatureCollection);
    });
    
    // this.map.on('load', () => {
    //   console.log("STOPS LOAD");
    //   if (!this.sourceAdded) {
    //     this.addSource();
    //   }
    //   // debugger;
    //   this.map.getSource('nearbystops').setData(FeatureCollection);
    // });
  }

  flyToDaStops() {
    this.map.flyTo({
      center: [
        this.props.lng,
        this.props.lat
      ]
    })
  }

  renderArrivalMarkers = (busLocation) => {
    console.log(busLocation);
    const FeatureBusCollection = {
      type: "FeatureCollection",

      features: busLocation.reduce((accumulator, bus) => {
        if (bus.blockPosition) {
          return [
            ...accumulator,
            bus,
          ];
        }
        return accumulator;
      }, []),

      // features: busLocation.map((nearbyBus) => {
      //   // debugger;
      //   return {
      //     id: nearbyBus.locid,
      //     type: "Feature",
      //     geometry: {
      //       type: "Point",
      //       coordinates: [
      //         nearbyBus.blockPosition.lng,
      //         nearbyBus.blockPosition.lat,
      //       ]
      //     }
      //   };
      // })
    };
    console.log('ARRIVAL ALMOST LOADED')
    
    this.mapIsReadyDeferred
      .promise
      .then(() => {
      console.log("ARRIVAL LOAD");
      this.map.getSource('nearbybus').setData(FeatureBusCollection);
    });
    // this.map.on('load', () => {
    //   console.log("ARRIVAL LOAD");
    //   console.log(this);
    //   if (!this.sourceAdded) {
    //     this.addSource();
    //   }
    //   this.map.getSource('nearbybus').setData(FeatureBusCollection);
    //   // debugger;
    // });
  }


  // renderMarkers = (location) => {
  //   const FeatureCollection = {
  //     type: "FeatureCollection",
  //     features: location.map((nearbyStop) => {
  //       return {
  //         id: nearbyStop.locid,
  //         type: "Feature",
  //         geometry: {
  //           type: "Point",
  //           coordinates: [
  //             nearbyStop.lng,
  //             nearbyStop.lat,
  //           ]
  //         }
  //       };
  //     }),
  //   };
    
  //   this.map.on('load', () => {
  //     if (!this.sourceAdded) {
  //       this.addSource();
  //     }
  //     this.map.getSource('nearbystops').setData(FeatureCollection);
  //   });
  // }




      // query the map instance for the points source feature by id.(bing-bong)
      // Update its position. 

      
      // this.map.loadImage(`${busIcon}`, (error, image) => {
      //   // console.log(this, "this");
      //   // console.log('renderMarkers', "LAT:" + lat, "LNG" + lng);
      //   // console.log(this.state);
      //   if (error) throw error;
      //   this.map.addImage('stop', image);
      //   this.map.addLayer({
      //       "id": "points",
      //       "type": "symbol",
      //       "source": {
      //           "type": "geojson",
      //           "data": {
      //               "type": "FeatureCollection",
      //               "features": [{
      //                   id: 'bing-bong',
      //                   "type": "Feature",
      //                   "geometry": {
      //                       "type": "Point",
      //                       "coordinates": [this.props.lng, this.props.lat]
      //                   }
      //               }]
      //           }
      //       },
      //       "layout": {
      //           "icon-image": "stop",
      //           "icon-size": 0.10,
      //           "icon-allow-overlap": true
      //       }
      //   });
    // });

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


  render() {    
    return(
      <div className="map-container">
        {/* <div className="inline-block absolute top left mt12 ml12 bg-darken75 color-white z1 py6 px12 round-full txt-s txt-bold">
          <div>{`Longitude: ${lng} Latitude: ${lat} Zoom: ${zoom}`}</div>
        </div> */}
        <div ref={this.mapContainer} className="absolute top right left bottom" />
      </div>
    );
  }
}

export default Mapbox;

import React, { PureComponent } from 'react';
import busIcon from './assets/bus-icon.png';
import stopIcon from './assets/stop-icon.png';
import './Mapbox.css';
import mapboxgl from 'mapbox-gl';
import moment from 'moment';


mapboxgl.accessToken = `${process.env.REACT_APP_MAPBOX_KEY}`;

class Mapbox extends PureComponent {
  mapContainer = React.createRef();
  
  componentDidMount() {
    const { lng, lat, zoom } = this.props;

    this.map = new mapboxgl.Map({
      container: this.mapContainer && this.mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v8',
      center: [ lng, lat ],
      zoom: 13,
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
        'icon-anchor': 'bottom',
        'text-allow-overlap': true,
        'text-field': '{title}',
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-anchor': 'top',
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
        'icon-size': 0.15,
        'icon-allow-overlap': true,
        'text-allow-overlap': true,
        'text-field': '{title}',
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-offset': [0, 2],
        'text-anchor': 'top',
      }
    });

    this.sourceAdded = true;
    this.mapIsReadyDeferred.resolve();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.nearbyStops.length && !this.stopsLoaded) {
      this.renderMarkers(this.props.nearbyStops);
    }
    if (prevProps.locid !== this.props.locid) {
      this.setActiveStop(this.props.locid);
      this.flyToDaStops();
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
        this.map.getSource('nearbystops').setData(FeatureCollection);
      });
  }

  flyToDaStops() {
    this.map.flyTo({
      center: [
        this.props.lng,
        this.props.lat
      ],
      zoom: 14,
      speed: 0.2
    })
  }

  // TO DO: 
  // 
  // flyToDaBus() {
  //   this.map.flyTo({
  //     center: [
  //       this.props.busLng,
  //       this.props.busLat
  //     ],
  //     zoom: 14,
  //     speed: 0.3
  //   })
  // }

  renderArrivalMarkers = (busLocation) => {
    const FeatureBusCollection = {
      type: "FeatureCollection",

      features: busLocation.reduce((accumulator, bus) => {
        if (bus.blockPosition) {
          return [
            ...accumulator,
            {
              id: bus.locid,
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [
                  bus.blockPosition.lng,
                  bus.blockPosition.lat,
                ]
              },
              properties: {
                title: bus.shortSign + ' ' + 'ETA:' + ' ' + moment(bus.estimated).format('h:mm A'),
              },
            }
          ];
        }
        return accumulator;
      }, []),
    };

    this.mapIsReadyDeferred
      .promise
      .then(() => {
        console.log("ARRIVAL LOAD");
        this.map.getSource('nearbybus').setData(FeatureBusCollection);
      });
  }

  render() {    
    return(
      <div className="map-container">
        <div ref={this.mapContainer} className="absolute top right left bottom" />
      </div>
    );
  }
}

export default Mapbox;

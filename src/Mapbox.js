import React, { PureComponent } from 'react';

//assets
import busIcon from './assets/bus-icon.png';
import stopIcon from './assets/stop-icon.png';

//styles
import './Mapbox.css';

//packages
import mapboxgl from 'mapbox-gl';
import moment from 'moment';


mapboxgl.accessToken = `${process.env.REACT_APP_MAPBOX_KEY}`;

class Mapbox extends PureComponent {
  mapContainer = React.createRef();
  
  componentDidMount() {
    const { lng, lat } = this.props;
 
    this.map = new mapboxgl.Map({
      container: this.mapContainer && this.mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v8',
      center: [
        lng, 
        lat,
      ],
      zoom: 13,
    });

    this.geoLocateControl = new mapboxgl.GeolocateControl(
      {
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }
    );

    this.navControl = new mapboxgl.NavigationControl();

    this.map.addControl(this.geoLocateControl);
    this.map.addControl(this.navControl);

    this.mapIsReady = new Promise((resolve, reject) => {
      this.mapWasZoomedToFitBounds = false;

      this.map.on('load', () => {
        this.map.loadImage(`${busIcon}`, (error, image) => {
          if (error) throw error;
          this.map.addImage('bus', image);
  
          this.map.loadImage(`${stopIcon}`, (error, image) => {
            if (error) throw error;
            this.map.addImage('stop', image);
  
            if (!this.sourceAdded) {
              this.addSource();
              resolve();
            }
          });
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
        'text-color': "#202",
        'text-halo-color': "#fff",
        'text-halo-width': 2
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
        'icon-opacity': 1,
        'text-color': "#202",
        'text-halo-color': "#fff",
        'text-halo-width': 2
      },
      layout: {
        'icon-image': 'bus',
        'icon-size': 0.10,
        'icon-allow-overlap': true,
        'text-allow-overlap': true,
        'text-field': '{title}',
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-max-width': 200,
        'text-size': 12,
        'text-offset': [0, 2],
        'text-anchor': 'top',
      }
    });

    this.sourceAdded = true;
  }

  componentDidUpdate(prevProps) {
    if (this.props.nearbyStops.length && !this.stopsLoaded) {
      this.renderMarkers(this.props.nearbyStops);
    }
    if (prevProps.locid !== this.props.locid) {
      this.setActiveStop(this.props.locid);
      this.mapWasZoomedToFitBounds = false;
    } 
    if (this.props.busLocation.length && this.props.busLocation !== prevProps.busLocation) {
      this.renderArrivalMarkers(this.props.busLocation);
      if (!this.mapWasZoomedToFitBounds) {
        this.fitToShowArrivals();
      }
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
  
  fitToShowArrivals() {
    this.mapIsReady
      .then(() => {
        if (!this.props.busLocation) { return; }

        const lngLatBounds = new mapboxgl.LngLatBounds();

        this.props.busLocation
          .forEach((busLoc) => {
            if (busLoc.blockPosition) {
              lngLatBounds.extend([busLoc.blockPosition.lng, busLoc.blockPosition.lat]);          
            }
          });

        lngLatBounds.extend([this.props.lng, this.props.lat]);        

        if (window.matchMedia('(max-width: 500px)').matches) {
          this.map.fitBounds(lngLatBounds, {
              padding: {
                top: 200, 
                bottom: 40, 
                left: 40, 
                right: 40,
              }
            });  
        } else {
          this.map.fitBounds(lngLatBounds, {
            padding: {
              top: 40, 
              bottom: 40, 
              left: 300, 
              right: 40,
            }
          });  
        }
        this.mapWasZoomedToFitBounds = true;
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

    this.mapIsReady
      .then(() => {
        this.map.getSource('nearbystops').setData(FeatureCollection);
      });
  }

  renderArrivalMarkers = (busLoc) => {
    const FeatureBusCollection = {
      type: "FeatureCollection",
      features: busLoc.reduce((accumulator, bus) => {
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
                title: bus.shortSign + ' ' + '|' + ' ' + moment(bus.estimated).format('h:mm A'),
              },
            }
          ];
        }
        return accumulator;
      }, []),
    };

    this.mapIsReady
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

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// packages
import mapboxgl from 'mapbox-gl';
import moment from 'moment';

// assets
import busIcon from './assets/bus-icon.png';
import stopIcon from './assets/stop-icon.png';

// styles
import './Mapbox.css';

mapboxgl.accessToken = `${process.env.REACT_APP_MAPBOX_KEY}`;

class Mapbox extends PureComponent {
  mapContainer = React.createRef();

  constructor(props) {
    super(props);
    this.onMapLoad = this.onMapLoad.bind(this);

    this.state = {
      hasMapLoaded: false,
    };
  }

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
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      },
    );

    this.navControl = new mapboxgl.NavigationControl();
    this.map.addControl(this.geoLocateControl);
    this.map.addControl(this.navControl);
    this.mapWasZoomedToFitBounds = false;
    this.map.on('load', this.onMapLoad);
  }

  async onMapLoad() {
    this.map.loadImage(`${busIcon}`, (error, image) => {
      // if (error) throw error;
      this.map.addImage('bus', image);

      this.map.loadImage(`${stopIcon}`, (error, stopImage) => {
        // if (error) throw error;
        this.map.addImage('stop', stopImage);
        this.addSource();
      });
    });
  }

  addSource() {
    this.map.addSource('nearbystops', {
      type: 'geojson',
      data: null,
    });

    this.map.addSource('nearbybus', {
      type: 'geojson',
      data: null,
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
          0,
        ],
        'text-opacity': [
          'case',
          ['boolean', ['feature-state', 'active'], false],
          1,
          0,
        ],
        'text-color': '#202',
        'text-halo-color': '#fff',
        'text-halo-width': 2,
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
      },
    });

    this.map.addLayer({
      id: 'nearbybus',
      type: 'symbol',
      source: 'nearbybus',
      paint: {
        'icon-opacity': 1,
        'text-color': '#202',
        'text-halo-color': '#fff',
        'text-halo-width': 2,
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
      },
    });

    this.setState({
      hasMapLoaded: true,
    }, () => {
      const { nearbyStops } = this.props;

      if (nearbyStops.length) {
        console.log('incallback');
        this.renderMarkers(nearbyStops);
      }
    });
  }

  componentDidUpdate(prevProps) {
    const { nearbyStops, locID, busLocation } = this.props;
    if (nearbyStops.length
      && nearbyStops !== prevProps.nearbyStops
    ) {
      this.renderMarkers(nearbyStops);
    }

    if (prevProps.locID !== locID && locID) {
      this.setActiveStop(locID);
      this.mapWasZoomedToFitBounds = false;
    }

    if (busLocation.length && busLocation !== prevProps.busLocation) {
      this.renderArrivalMarkers(busLocation);
      if (!this.mapWasZoomedToFitBounds) {
        this.fitToShowArrivals();
      }
    }
  }

  setActiveStop(locId) {
    const { locID } = this.props;
    if (this.previouslySelectedLocid) {
      this.map.setFeatureState({
        source: 'nearbystops',
        id: this.previouslySelectedLocid,
      },
      {
        active: false,
      });
    }
    this.previouslySelectedLocid = locId;

    this.map.setFeatureState({
      source: 'nearbystops',
      id: locID,
    },
    {
      active: true,
    });
  }

  fitToShowArrivals() {
    const { hasMapLoaded } = this.state;
    const { busLocation, lat, lng } = this.props;
    if (!hasMapLoaded) { return; }
    const lngLatBounds = new mapboxgl.LngLatBounds();

    busLocation
      .forEach((busLoc) => {
        if (busLoc.blockPosition) {
          lngLatBounds.extend([busLoc.blockPosition.lng, busLoc.blockPosition.lat]);
        }
      });

    lngLatBounds.extend([lng, lat]);

    if (window.matchMedia('(max-width: 500px)').matches) {
      this.map.fitBounds(lngLatBounds, {
        padding: {
          top: 200,
          bottom: 40,
          left: 40,
          right: 40,
        },
      });
    } else {
      this.map.fitBounds(lngLatBounds, {
        padding: {
          top: 40,
          bottom: 40,
          left: 300,
          right: 40,
        },
      });
    }
    this.mapWasZoomedToFitBounds = true;
  }

  renderMarkers = (nearbyStops) => {
    const { hasMapLoaded } = this.state;
    if (!hasMapLoaded) { return; }
    console.log('rendering markers');
    const FeatureCollection = {
      type: 'FeatureCollection',
      features: nearbyStops.map(nearbyStop => ({
        id: nearbyStop.locid,
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            nearbyStop.lng,
            nearbyStop.lat,
          ],
        },
        properties: {
          title: `${'Stop' + ' ' + '#'}${nearbyStop.locid}`,
        },
      })),
    };

    this.map.getSource('nearbystops').setData(FeatureCollection);
  }

  renderArrivalMarkers = (busLoc) => {
    const { hasMapLoaded } = this.state;
    if (!hasMapLoaded) { return; }
    const FeatureBusCollection = {
      type: 'FeatureCollection',
      features: busLoc.reduce((accumulator, bus) => {
        if (bus.blockPosition) {
          return [
            ...accumulator,
            {
              id: bus.locID,
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [
                  bus.blockPosition.lng,
                  bus.blockPosition.lat,
                ],
              },
              properties: {
                title: `${bus.shortSign} ` + '|' + ` ${moment(bus.estimated).format('h:mm A')}`,
              },
            },
          ];
        }
        return accumulator;
      }, []),
    };

    this.map.getSource('nearbybus').setData(FeatureBusCollection);
  }

  render() {
    return (
      <div className="map-container">
        <div ref={this.mapContainer} className="absolute top right left bottom" />
      </div>
    );
  }
}

export default Mapbox;

Mapbox.propTypes = {
  busLocation: PropTypes.arrayOf(PropTypes.object).isRequired,
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
  locID: PropTypes.number.isRequired,
  nearbyStops: PropTypes.arrayOf(PropTypes.object).isRequired,
};

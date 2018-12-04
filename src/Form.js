import React, { PureComponent } from 'react';
import './Form.css';
import logo from './assets/trimet-icon.png';
import axios from 'axios';



// Material Styles
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const styles = {
  card: {
    width: '100%',
    paddingBottom: '25px'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '375px',
  },
  submitButton: {
    width: '40px',
    marginLeft: '20px',
    height: '57px',
    // margin: '0 auto'
  },
  input: {
    width: '200px',
  },
  root: {
    display: 'block',
    margin: '0 auto',
    width: '300px'
  },
  formControl: {
    margin: '30px',
    width: '240px'
  }
};

class Form extends PureComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    // if (this.props.locid) {
    //   // this.setState({
    //   //   locid: this.props.locid
    //   // })
    //   // this.fetchArrivalTimes()
    //   if (this.intervalId) {
    //     window.clearInterval(this.intervalId);
    //   }

      // this.intervalId = setInterval(() => this.fetchArrivalTimes(), 3500);
    // }
  }

  handleChange({ target: { value } }) {
    this.props.onStopSelected(value);
  }


  // fetchArrivalTimes = () => {
  //   console.log("Arrival called!")
  //   const TRIMET_API_KEY = `0BD1DE92EE497EA57B0C32698`;

  //   axios
  //     .get(`https://developer.trimet.org/ws/V1/arrivals?locIDs=${this.state.locid}&appID=${TRIMET_API_KEY}&json=true`)
  //     .then(res => this.setState({
  //       ...this.setState,
  //       location: res.data.resultSet.arrival,
  //       lat: res.data.resultSet.arrival[0].blockPosition.lat,
  //       lng: res.data.resultSet.arrival[0].blockPosition.lng
  //     }))
  //     .catch(error => console.log(error)
  //     )
  // }

  render() {
    const { classes, locid } = this.props;
    return (
      <div className="forms">
        <div className="web-form-container">
            <Card
              style={styles.card}
            >
              <CardContent
                style={styles.cardContent}
              >
                  <img alt="trimet-logo" className="trimet-logo" src={logo} />
                  <div>
                    <h3>TRIP</h3>
                    <h3>LOCATOR</h3>
                  </div>
                <form className="arrival-form" onSubmit={this.handleSubmit}>
                  <FormControl className={classes.formControl}>
                      <InputLabel htmlFor='stop-id'>Find Stops Near Me</InputLabel>
                      <Select
                        value={locid || ''}
                        onChange={this.handleChange}
                        onClick={this.handleClick}
                        classes={{
                          root: classes.root
                        }}
                        inputProps={{
                          name: 'locid',
                          id: 'stop-id'
                        }}
                      >
                        {this.props.nearbyStops.length > 0
                        ? this.props.nearbyStops.map(({ desc, locid, lat, dir }) => (
                          <MenuItem key={lat} value={locid} className="nearby-results">
                            {`${desc} ${dir} ${locid}`}
                          </MenuItem>
                        ))
                        : (<MenuItem value="">Locating nearby stops...</MenuItem>)
                      }
                      </Select>
                    </FormControl>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="mobile-form-container">
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <img alt="trimet-logo" className="trimet-logo" src={logo} />
                <h2>TRIP LOCATOR</h2>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                {/* <Card
                  style={styles.card}
                >
                  <CardContent
                    style={styles.cardContent}
                  > */}
                      {/* <img alt="trimet-logo" className="trimet-logo" src={logo} />
                      <div>
                        <h3>TRIP</h3>
                        <h3>LOCATOR</h3>
                      </div> */}
                    <form className="arrival-form" onSubmit={this.handleSubmit}>
                      <FormControl className={classes.formControl}>
                          <InputLabel htmlFor='stop-id'>Find Stops Near Me</InputLabel>
                          <Select
                            value={locid || ''}
                            onChange={this.handleChange}
                            onClick={this.handleClick}
                            classes={{
                              root: classes.root
                            }}
                            inputProps={{
                              name: 'locid',
                              id: 'stop-id'
                            }}
                          >
                            {this.props.nearbyStops.length > 0
                            ? this.props.nearbyStops.map(({ desc, locid, lat, dir }) => (
                              <MenuItem key={lat} value={locid} className="nearby-results">
                                {`${desc} ${dir} ${locid}`}
                              </MenuItem>
                            ))
                            : (<MenuItem value="">Locating nearby stops...</MenuItem>)
                          }
                          </Select>
                        </FormControl>
                    </form>
                  {/* </CardContent>
                </Card> */}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </div>
      </div>

      
    );
  }
}


export default withStyles(styles)(Form)

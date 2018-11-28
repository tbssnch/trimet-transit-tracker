import React, { Component } from 'react';
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
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FilledInput from '@material-ui/core/FilledInput';

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

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: [],
      locid: '',
      lat: '',
      lng: ''
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.locid !== prevState.locid) {
      // this.setState({
      //   locid: this.props.locid
      // })
      this.fetchArrivalTimes()
    }
  }

  handleChange = ({ target: {name, value} }) => this.setState ({ [name] : value })


  onHandleChange = event => {
    this.props.handleChange(event);
  };

  fetchArrivalTimes = () => {
    console.log("Arrival called!")
    const TRIMET_API_KEY = `0BD1DE92EE497EA57B0C32698`;
    // const { lat, lng } = this.state;
    axios
      .get(`https://developer.trimet.org/ws/V1/arrivals?locIDs=${this.state.locid}&appID=${TRIMET_API_KEY}&json=true`)
      .then(res => this.setState({
        location: res.data.resultSet.arrival,
        lat: res.data.resultSet.arrival[1].blockPosition.lat,
        lng: res.data.resultSet.arrival[1].blockPosition.lng
      }))
      .catch(error => console.log(error)
      )
  }

  render() {
    console.log(this.props);
    console.log(this.state);
    const { location, classes, locid } = this.props;
    return (
      <div className="form-container">
        <Card
          style={styles.card}
        >
          <CardContent
            style={styles.cardContent}
          >
              <img alt="trimet-logo" className="trimet-logo" src={logo} />
              <h5>Where's my bus or MAX?</h5>
            <form className="arrival-form" onSubmit={this.handleSubmit}>
               <FormControl className={classes.formControl}>
                  <InputLabel htmlFor='stop-id'>Find Stops Near Me</InputLabel>
                  <Select
                    value={locid}
                    onClick={this.handleChange}
                    classes={{
                      root: classes.root
                    }}
                    inputProps={{
                      name: 'locid',
                      id: 'stop-id'
                    }}
                  >
                    {location.length > 0
                    ? location.map(({ desc, locid, lat, dir }) => (
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
    );
  }
}


export default withStyles(styles)(Form)

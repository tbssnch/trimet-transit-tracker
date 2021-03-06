import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// assets

// styles
import './Form.css';

// material styles
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { withStyles } from '@material-ui/core/styles';
import logo from './assets/trimet-icon.png';

const styles = {
  card: {
    width: '100%',
    paddingBottom: '25px',
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
  },
  input: {
    width: '200px',
  },
  root: {
    display: 'block',
    margin: '0 auto',
    width: '300px',
  },
  formControl: {
    margin: '30px',
    width: '240px',
  },
  mobileCardContent: {
    paddingBottom: '0px',
  },
};

class Form extends PureComponent {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange({ target: { value } }) {
    const { onStopSelected } = this.props;
    onStopSelected(value);
  }

  render() {
    const { classes, locID, nearbyStops } = this.props;
    return (
      <div className="forms">
        <div className="web-form-container">
          <Card
            style={styles.card}
          >
            <CardContent
              style={styles.cardContent}
            >
              <div className="transit-tracker-logo">
                <img alt="trimet-logo" className="trimet-logo" src={logo} />
                <h3>TRANSIT</h3>
                <h3>TRACKER</h3>
              </div>
              <form className="arrival-form" onSubmit={this.handleSubmit}>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="stop-id">Find Stops Near Me</InputLabel>
                  <Select
                    value={locID || ''}
                    onChange={this.handleChange}
                    onClick={this.handleClick}
                    classes={{
                      root: classes.root,
                    }}
                    inputProps={{
                      name: 'locID',
                      id: 'stop-id',
                    }}
                  >
                    {nearbyStops.length > 0
                      ? nearbyStops.map(({
                        desc, locid, lat, dir,
                      }) => (
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
          <Card
            style={styles.mobileCard}
          >
            <CardContent
              style={styles.mobileCardContent}
            >
              <div className="mobile-card-content">
                <div className="mobile-logo">
                  <img alt="trimet-logo" className="trimet-logo" src={logo} />
                  <h2>TRANSIT TRACKER</h2>
                </div>
                <form className="arrival-form" onSubmit={this.handleSubmit}>
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="stop-id">Find Stops Near Me</InputLabel>
                    <Select
                      value={locID || ''}
                      onChange={this.handleChange}
                      onClick={this.handleClick}
                      classes={{
                        root: classes.root,
                      }}
                      inputProps={{
                        name: 'locID',
                        id: 'stop-id',
                      }}
                    >
                      {nearbyStops.length > 0
                        ? nearbyStops.map(({
                          desc, lat, dir,
                        }) => (
                          <MenuItem key={lat} value={locID} className="nearby-results">
                            {`${desc} ${dir} ${locID}`}
                          </MenuItem>
                        ))
                        : (<MenuItem value="">Locating nearby stops...</MenuItem>)
                        }
                    </Select>
                  </FormControl>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Form);

Form.propTypes = {
  onStopSelected: PropTypes.number.isRequired,
  classes: PropTypes.string.isRequired,
  locID: PropTypes.number.isRequired,
  nearbyStops: PropTypes.arrayOf(PropTypes.object).isRequired,
};

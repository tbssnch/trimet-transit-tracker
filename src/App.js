import React, { Component } from 'react';
import axios from 'axios';
import Mapbox from './Mapbox';
import Form from './Form';

class App extends Component {
  // state = {
  //   data: [],
  //   id: 0,
  //   message: null,
  //   intervalIsSet: false,
  //   isToDelete: null,
  //   isToUpdate: null,
  //   objectToUpdate: null
  // };

  // componentDidMount() {
  //   this.getDataFromDb();
  //   if (!this.state.intervalIsSet) {
  //     let interval = setInterval(this.getDataFromDb, 1000);
  //     this.setState({ intervalIsSet: interval });
  //   }
  // }

  // componentWillUnmount() {
  //   if (this.state.intervalIsSet) {
  //     clearInterval(this.state.intervalIsSet);
  //     this.setState({ intervalIsSet: null });
  //   }
  // }

  // getDataFromDb = () => {
  //   fetch("/api/getData")
  //     .then(data => data.json())
  //     .then(res => this.setState({ data: res.data }));
  // };

  // putDataToDB = message => {
  //   let currentIds = this.state.data.map(data => data.id);
  //   let idToBeAdded = 0;
  //   while (currentIds.includes(idToBeAdded)) {
  //     ++idToBeAdded;
  //   }

  //   axios.post("/api/putData", {
  //     id: idToBeAdded,
  //     message: message
  //   });
  // };

  // deleteFromDb = isToDelete => {
  //   let objIdToDelete = null;
  //   this.state.data.forEach(dat => {
  //     if (dat.id === isToDelete) {
  //       objIdToDelete = dat._id;
  //     }
  //   });

  //   axios.delete('/api/deleteData', {
  //     data: {
  //       id: objIdToDelete
  //     }
  //   });
  // };

  // updateDB = (idToUpdate, updateToApply) => {
  //   let objIdToUpdate = null;
  //   this.state.data.forEach(dat => {
  //     if (dat.id === idToUpdate) {
  //       objIdToUpdate = dat._id;
  //     }
  //   });

  //   axios.post("/api/updateData", {
  //     id: objIdToUpdate,
  //     update: { message: updateToApply }
  //   });
  // };


  render() {
    return (
      <>
        <Mapbox />
      </>

    );
  }
}


export default App;

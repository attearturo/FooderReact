import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import * as firebase from 'firebase';

var config = {
    apiKey: "AIzaSyDmFoDExbaLNWePwLQ1pGsyhl3_kh46efA",
    authDomain: "fooderhci.firebaseapp.com",
    databaseURL: "https://fooderhci.firebaseio.com",
    projectId: "fooderhci",
    storageBucket: "fooderhci.appspot.com",
    messagingSenderId: "832312219816"
  };

  firebase.initializeApp(config);

  //Autenticación project-832312219816

ReactDOM.render(<App/>, document.getElementById('root'));
registerServiceWorker();



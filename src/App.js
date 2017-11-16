import React, { Component } from 'react';
import logo from './logo.svg';
import * as firebase from 'firebase';
import FileUpload from './FileUpload';
import './App.css';

[
  {category: "Sporting Goods", price: "$49.99", stocked: true, name: "Football"},
  {category: "Sporting Goods", price: "$9.99", stocked: true, name: "Baseball"},
  {category: "Sporting Goods", price: "$29.99", stocked: false, name: "Basketball"},
  {category: "Electronics", price: "$99.99", stocked: true, name: "iPod Touch"},
  {category: "Electronics", price: "$399.99", stocked: false, name: "iPhone 5"},
  {category: "Electronics", price: "$199.99", stocked: true, name: "Nexus 7"}
];

class App extends Component {

  constructor(){
    super();
    this.state = {
      user:null,
      pictures: [],
      nombre: 10
    };
    this.handleAuth = this.handleAuth.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  componentDidMount (){
    //Sincronización con autenticacion
    firebase.auth().onAuthStateChanged(user => {
      console.log('Ingreso al usuario');
      this.setState({ user });
    });
  
    //Sincronizacion con database
    firebase.database().ref().on('value', snap => console.log(snap.val()));
    const rootRef = firebase.database().ref();
    const nombre = rootRef.child('nombre');
    const pictures = rootRef.child('pictures');

    nombre.on('value', snap => {
      var test = snap.val();
      console.log(test)
      this.setState({
        nombre: test
      });
    });

    pictures.on('child_added', snapshot =>{
      this.setState({
        pictures: this.state.pictures.concat(snapshot.val())
      });
    });
  }

  handleAuth(){
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
    .then(result => console.log(`${result.user.email} Ha iniciado sesión`))
    .catch(error => console.log(`Error ${error.code}: ${error.message}`));
  }

  handleLogout(){
    firebase.auth().signOut()
    .then(result => console.log(`${result.user.email} ha cerrado sesión`))
    .catch(error => console.log(`Error ${error.code}: ${error.message}`));
  }


  handleUpload(event){
    const file = event.target.files[0];
    const storageRef = firebase.storage().ref(`/fotos/${file.name}`);
    const task = storageRef.put(file);

    task.on('state_changed', snapshot =>{
      let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      this.setState({
        uploadValue: percentage
      })
    }, error => {
      console.log(error.message);
    }, () => {
      const record = {
        photoURL: this.state.user.photoURL,
        displayName: this.state.user.displayName,
        image: task.snapshot.downloadURL
      };

      const dbRef = firebase.database().ref('pictures');
      const newPicture = dbRef.push();
      newPicture.set(record);
    });
  }

  renderRestauranteIndividual(){
    return(
      <div class="individual">
        <img class="imagen" style="width:100%" src="restaurantes/${infoVinilo.imagen}" class="img-responsive"/>
        <div class="middle">
              <button
              ><h4 class="text">Ver más</h4>
              </button>
        </div>
        <h4><strong>${infoVinilo.nombre}</strong></h4>
			<p>${infoVinilo.direccion}</p>
			<p>Precio promedio $ ${infoVinilo.direccion}</p>
			<h4 class="colorPrice">Valoración <strong>${infoVinilo.ranking}</strong> (${infoVinilo.review} votos) </h4>
      </div>
    );
  }


  renderLoginButton(){
    //Si el usuario está logueado
    if(this.state.user){
      return(
        <div className='App-intro'>

          <img width='100' src={this.state.user.photoURL} alt={this.state.user.displayName}/>
          <p>Hola, {this.state.user.displayName}</p>
          <button onClick={this.handleLogout}>
          Salir
          </button>

          <FileUpload onUpload={ this.handleUpload }/>

          {
            this.state.pictures.map(picture => (
              <div className='App-card'>
                <figure className='App-card-image'>
                <img width='320' src={picture.image}/>
                <figcaption className='App-card-footer'>
                <img className='App-card-avatar' src={picture.photoURL} alt={picture.displayName}/>
                <p>{picture.displayName}</p>
                </figcaption>
                </figure>
              </div>
            )).reverse()
          }

        </div>
      );
    }else{
    //Si no lo está
    return(
      <div className='fondo'>
      <div id='container'>
        <h1 className='titleHeader'>Fooder</h1>
        <h4 className='subtitulo' onClick={this.handleAuth}> Arma tu plan, escoge a donde ir.</h4>
        <div className='blurBtn'>
        <button className='empezar' onClick={this.handleAuth}>Empezar</button>
        <div className='blurBack'></div>
        </div>
      </div>
      <div className='arrow'><img src='img/arrowsm.png'/></div>
    </div>
    );
    }
  }

  render() {
    return (
      <div className="App">

        <div className="login">
          {this.renderLoginButton()}
        </div>
        
      </div>
    );
  }
}

export default App;

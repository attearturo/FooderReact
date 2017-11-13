import React, { Component } from 'react';
import logo from './logo.svg';
import * as firebase from 'firebase';
import FileUpload from './FileUpload';
import './App.css';

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
    const rootRef = firebase.database().ref().child('fooderhci');
    const nombre = rootRef.child('nombre');
    const pictures = rootRef.child('pictures');

    nombre.on('value', snap => {
      this.setState({
        nombre: snap.val()
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
                <figCaption className='App-card-footer'>
                <img className='App-card-avatar' src={picture.photoURL} alt={picture.displayName}/>
                <span className='App-card-name'>{picture.displayName}</span>
                </figCaption>
                </figure>
              </div>
            )).reverse()
          }

        </div>
      );
    }else{
    //Si no lo está
    return(
    <button onClick={this.handleAuth}>Login con Google</button>
    );
    }
  }


  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Bienvenido a Fooder</h1>
        </header>
        <p className="login">
          {this.renderLoginButton()}
        </p>
        <h1>{this.state.nombre}</h1>
      </div>
    );
  }
}

export default App;

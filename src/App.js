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
      restaurantes: [],
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
    const restaurantes = rootRef.child('restaurantes');

    nombre.on('value', snap => {
      var test = snap.val();
      console.log(test)
      this.setState({
        nombre: test
      });
    });

    restaurantes.on('child_added', snapshot =>{
      this.setState({
        restaurantes: this.state.restaurantes.concat(snapshot.val())
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

      const dbRef = firebase.database().ref('restaurantes');
      const newPicture = dbRef.push();
      newPicture.set(record);
    });
  }


  renderLoginButton(){
    //Si el usuario está logueado
    if(this.state.user){
      return(
        <div className='App-intro'>


        <div className='fondo'>
              <div id='container'>
                <h1 className='titleHeader'>Fooder</h1>
                <h4 className='subtitulo' onClick={this.handleAuth}> Hola, {this.state.user.displayName}</h4>
                <img width='100' src={this.state.user.photoURL} alt={this.state.user.displayName}/>
                <div className='blurBtn'>
                <button className='empezar' onClick={this.handleLogout}>Salir</button>
                </div>
              </div>
              <div className='arrow'><img src='img/arrowsm.png'/></div>
          </div>

          

          <FileUpload onUpload={ this.handleUpload }/>
          {
            this.state.restaurantes.map(elemento => (
              <div className='individual' data-size="1280x857">
                <a href={elemento.imagen} class="img-wrap">
                <img src={elemento.imagen} alt={elemento.nombre}/></a>
                
                <div class="description">
                  <h3>{elemento.nombre}</h3>
                  <p>{elemento.descripcion} <em>&mdash; {elemento.direccion}</em></p>
                  <div className="details">
                    <ul>
                      <li><i className="icon icon-camera"></i><span>{elemento.ranking}</span></li>
                      <li><i className="icon icon-focal_length"></i><span>{elemento.review}</span></li>
                      <li><i className="icon icon-aperture"></i><span>{elemento.zona}</span></li>
                      <li><i className="icon icon-exposure_time"></i><span>{elemento.precio}00</span></li>
                      <li><i className="icon icon-iso"></i><span>{elemento.phone}</span></li>
                    </ul>
                  </div>
                </div>
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

        <div className="login container">
          <div className="content">
            <div className="content"> 
              {this.renderLoginButton()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

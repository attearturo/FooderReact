import React, { Component } from 'react';
import * as firebase from 'firebase';
import FileUpload from './FileUpload';
import './App.css';
import StepRangeSlider from 'react-step-range-slider'

class App extends Component {

  constructor(){
    super();
    this.state = {
      user:null,
      restaurantes: [],
      value: 0,
      precio:0,
      puntajeOrden: {
        precio: "",
        zona: "",
        creatividad: "",
        tranquilidad: "",
        informalidad: "",
        comida: "",
    },
    range : [
      { value: 0, step: 1 }, // acts as min value
      { value: 20, step: 5 }, 
      { value: 50, step: 10 },
      { value: 100, step: 50 },
      { value: 500 } // acts as max value
    ]
    };
    this.handleAuth = this.handleAuth.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
    const restaurantes = rootRef.child('restaurantes');

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

  handleChange(event){
    this.setState({value: event.target.value});
    this.setState({precio: event.target.value});
  }

  handleSubmit(event){
    alert('Precio Slider: ' + this.state.value + 'Select: ' + this.state.precio);
    event.preventDefault();
  }

  renderFiltros(){
  
    return(
<header className="jumbotron text-center">
        <p>Cuales son tus preferencias</p>

        <h5>¿Que tal el ambiente?</h5>
            <form className="form-inline container" onSubmit={this.handleSubmit}>

            <StepRangeSlider 
              value={5} 
              range={range} 
              onChange={value => console.log(value)}
            />

            <select value={this.state.value} onChange={this.handleChange} 
            id="precio" className="form-control">
                <option value="">Precio</option>
                <option value="10-20">De $10.000 a $20.000</option>
                <option value="20-40">De $20.000 a $40.000</option>
                <option value="40-60">De $40.000 a $60.000</option>
                <option value="60-80">De $60.000 a $80.000</option>
                <option value="80-999">De $80.000 en adelante</option>
            </select>
            
            <select id="zona" className="form-control">
                <option value="">Zona</option>
                <option value="Sur">Sur</option>
                <option value="Norte">Norte</option>
                <option value="Occidente">Occidente</option>
                <option value="Oriente">Oriente</option>
                <option value="Centro">Centro</option>
            </select>
              
            <select id="creatividad" className="form-control">
                <option value="">Tradicional/Creativo</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>


            <select id="tranquilidad" className="form-control">
                <option value="">Tranquilo/Animado</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>


            <select id="informalidad" className="form-control">
                <option value="">Elegante/Informal</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>

            <select id="comida" className="form-control">
                <option value="">¿Tipo de comida?</option>
                <option value="Hamburguesa">Hamburguesa</option>
                <option value="Pizza">Pizza</option>
                <option value="Comida italiana">Comida italiana</option>
                <option value="Pollo o alitas">Pollo o alitas</option>
                <option value="Comida colombiana">Comida colombiana</option>
                <option value="Comida asiática">Comida asiática</option>
                <option value="Carnes y parrillas">Carnes y parrillas</option>
                <option value="Sushi">Sushi</option>
                <option value="Comida mexicana">Comida mexicana</option>
                <option value="Bebidas con alcohol">Bebidas con alcohol</option>
                <option value="Bebidas sin alcohol">Bebidas sin alcohol</option>
            </select>
            
            <button className="recomendar container col-lg-6" type="submit" value='Submit'>
            Recomendar
            </button>

        </form>
        
    </header>

          

    );
  }

  setFiltros() {

    //var header = document.querySelector('header');
    // puntajeOrden.precio = header.querySelector('#precio');
    // puntajeOrden.zona = header.querySelector('#zona');
    // puntajeOrden.creatividad = header.querySelector('#creatividad');
    // puntajeOrden.tranquilidad = header.querySelector('#tranquilidad');
    // puntajeOrden.informalidad = header.querySelector('#informalidad');
    // puntajeOrden.comida = header.querySelector('#comida');
    // this.ordenar(puntajeOrden);  
}

  ordenar(puntajeGlobal){
    var Precio = puntajeGlobal.precio.value;
    var Zona = puntajeGlobal.zona.value;
    var Tranquilidad = puntajeGlobal.tranquilidad.value;
    var Creatividad = puntajeGlobal.creatividad.value;
    var Informalidad = puntajeGlobal.informalidad.value;
    var Comida = puntajeGlobal.comida.value;

    console.log(
        ' Precio: ' + Precio +
        ' Zona: ' + Zona +
        ' Creatividad: ' + Creatividad +
        ' Tranquilidad: ' + Tranquilidad +
        ' Informalidad: ' + Informalidad +
        ' Comida: ' + Comida
    )
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
              <div className='arrow'><img src='img/arrowsm.png' alt=''/></div>
          </div>

          {this.renderFiltros()}
          <FileUpload onUpload={ this.handleUpload }/>
          
          {
            this.state.restaurantes.map(elemento => (
              <li className='col-md-4 lista'>
              
                <img className='imagen img-responsive' src={elemento.imagen} alt={elemento.nombre}/>
                <div className="middle">
                <button><h4 className="text">Ver más</h4></button>
                </div>
                  <h4><strong>{elemento.nombre}</strong></h4>
                  <p>{elemento.descripcion} <em>&mdash; {elemento.direccion}</em></p>
                  <h3 className="colorPrice">Valoración <strong>${elemento.ranking}</strong> (${elemento.review} votos) </h3>
                  <div className="details">
                    <ul>
                      <li><i className="icon icon-camera"></i><span>{elemento.ranking}</span></li>
                      <li><i className="icon icon-focal_length"></i><span>{elemento.review}</span></li>
                      <li><i className="icon icon-aperture"></i><span>{elemento.zona}</span></li>
                      <li><i className="icon icon-exposure_time"></i><span>{elemento.precio}00</span></li>
                      <li><i className="icon icon-iso"></i><span>{elemento.phone}</span></li>
                    </ul>
                  </div>
                </li>
            ))
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
      <div className='arrow'><img src='img/arrowsm.png' alt=''/></div>
    </div>
    );
    }
  }

  render() {
    return (
      <div className="App">
        <div className="login container">
              {this.renderLoginButton()}
        </div>
      </div>
    );
  }
}

export default App;

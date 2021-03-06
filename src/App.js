import React, { Component } from 'react';
import * as firebase from 'firebase';
import FileUpload from './FileUpload';
import './App.css';
//import StepRangeSlider from 'react-step-range-slider'

class App extends Component {

  constructor(){
    super();
    this.state = {
      user:null,
      preferencias:null,
      restaurantes: [],
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
    const preferencias = rootRef.child('preferencias');

    restaurantes.on('child_added', snapshot =>{
      this.setState({
        restaurantes: this.state.restaurantes.concat(snapshot.val()).sort(function (a, b){
          return a.ranking < b.ranking
          }),
        });
    });

    preferencias.on('child_added', snap =>{
      this.setState({ preferencias : snap.val() });
    });
  }
  handleAuth(){
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
    .then(result => console.log(`${result.user.email} Ha iniciado sesión`),)
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
    this.setState({
      [event.target.name] : event.target.value
    });

    const preferenciasOnline = firebase.database().ref('preferencias');

    preferenciasOnline.on('state_changed', snapshot =>{
      this.setState({
        [event.target.name] : event.target.value
      })
    }, error => {
      console.log(error.message);
    }, () => {
      const preferencias = {
        usuario: this.state.user.email
      };

      const nuevoFiltro = preferenciasOnline.push();
      nuevoFiltro.set(preferencias);
    });
  }
  handleSubmit(event){
    alert(this.state.preferencias.precio);
    event.preventDefault();
    const precio = this.state.preferencias.precio;
    const zona = this.state.preferencias.zona;
    const tranquilidad = this.state.preferencias.tranquilidad;
    const informalidad = this.state.preferencias.informalidad;
    const creatividad = this.state.preferencias.creatividad;
    const comida = this.state.preferencias.comida;

    var sumarPuntaje = this.state.restaurantes.forEach(function (elemento) {
      elemento.puntaje = 0;
        
      if (zona.includes(elemento.zona)) {
          elemento.puntaje += 1;
      }   
      
      var rango = precio.split("-");
      if (elemento.precio >= rango[0] && elemento.precio < rango[1]) {
          elemento.puntaje += 1;
      }
    
      if (elemento.tranquilidad <= tranquilidad) {
          elemento.puntaje += 1;
      }            
      
      if (elemento.creatividad <= creatividad) {
          elemento.puntaje += 1;
      }

      if (elemento.formalismo <= informalidad) {
          elemento.puntaje += 1;
      }
      var menuComida = elemento.especialidad.split(",");
      menuComida.forEach(function(tipo){
          if (comida.includes(tipo)) {
              elemento.puntaje += 1;
          }   
      });
      elemento.puntaje += elemento.ranking;
      console.log(elemento.puntaje)
  });
    this.state.restaurantes.sort(function (a, b){
      return a.puntaje < b.puntaje
    })
  }
  renderIntro(){
    return(
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
    )
  }
  renderFiltros(){
    return(

    <header className="jumbotron text-center">
        <p>Cuales son tus preferencias</p>

        <h5>¿Que tal el ambiente?</h5>
            <form className="form-inline container" 
            onChange={this.handleChange} onSubmit={this.handleSubmit}>

            <select value={this.state.precio} onChange={this.handleChange} 
            name='precio' id="precio" className="form-control">
                <option value="">Precio</option>
                <option value="10-20">De $10.000 a $20.000</option>
                <option value="20-40">De $20.000 a $40.000</option>
                <option value="40-60">De $40.000 a $60.000</option>
                <option value="60-80">De $60.000 a $80.000</option>
                <option value="80-999">De $80.000 en adelante</option>
            </select>
            <select value={this.state.zona} onChange={this.handleChange} 
            name='zona' id="zona" className="form-control">
                <option value="">Zona</option>
                <option value="Sur">Sur</option>
                <option value="Norte">Norte</option>
                <option value="Occidente">Occidente</option>
                <option value="Oriente">Oriente</option>
                <option value="Centro">Centro</option>
            </select>
            <select value={this.state.creatividad} onChange={this.handleChange}
            name='creatividad' id="creatividad" className="form-control">
                <option value="">Tradicional/Creativo</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
            <select value={this.state.tranquilidad} onChange={this.handleChange}
            name='tranquilidad' id="tranquilidad" className="form-control">
                <option value="">Tranquilo/Animado</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
            <select value={this.state.informalidad} onChange={this.handleChange}
            name='informalidad' id="informalidad" className="form-control">
                <option value="">Elegante/Informal</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
            <select value={this.state.comida} onChange={this.handleChange}
            name='comida' id="comida" className="form-control">
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
            
            <button className="recomendar container col-lg-6" type="submit" 
            value='Submit'>
            Recomendar
            </button>
        </form>
      </header>

    );
  }
  renderLoginButton(){
    //Si el usuario está logueado
    if(this.state.user){
      return(
        <div className='App-intro'>

          {this.renderFiltros()}
          <FileUpload onUpload={ this.handleUpload }/>
          
          {
            this.state.restaurantes.map(elemento => (
              <div className='col-md-4 lista' key = {elemento.nombre}>
              
                <img className='imagen img-responsive' src={elemento.imagen} alt={elemento.nombre}/>
                <div className="middle">
                <button className="text">Ver más</button>
                </div>
                  <h4><strong>{elemento.nombre}</strong></h4>
                  <p>{elemento.ranking} <em>&mdash; {elemento.direccion}</em></p>
                  <h3 className="colorPrice">Valoración <strong>${elemento.ranking}</strong> (${elemento.review} votos) </h3>
                </div>
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
import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import "../../app.css";
import AdminHeader from "../../Headers/AdminHeader";
import urlDB from "../../dbURL";

class App extends Component {
  constructor(props) {
    super(props);
    this.cadastrar = this.cadastrar.bind(this);
    this.render = this.render.bind(this);
    this.state = {
      salas: [],
      redirect: false
    };
  }

  componentDidMount() {
    this.loadSalas();
    this.initDados(this.props.location.state.idItem);
  }

  loadSalas() {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB + "salas", {
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      }
    })
      .then(response => response.json())
      .then(s => this.setState({ salas: s }));
  }

  rows() {
    let r = [];
    this.state.salas.forEach(sala => {
      r.push(
        <option key={sala.cod} value={sala.cod}>
          {sala.nome}
        </option>
      );
    });
    return r;
  }

  initDados(codiginho) {
    let itemzinho;
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB + "oneItem", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      },
      body: JSON.stringify({
        cod: codiginho
      })
    })
      .then(response => response.json())
      .then(item => {
        if (Array.isArray(item)) {
          itemzinho = item[0];
          this.refs.itemField.value =
            itemzinho.cod + " - " + itemzinho.descricao;
        } else {
          console.log(item.dbError);
        }
      })
      .catch(err => console.log(err));
  }

  cadastrar() {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB + "novo/localizacao", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      },
      body: JSON.stringify({
        item: this.props.location.state.idItem,
        sala: this.refs.salaSelect.value
      })
    })
      .then(response => response.json())
      .then(resp => {
        if (Array.isArray(resp) || resp === 1) {
          this.setState({ redirect: "/itens" });
        } else {
          alert("Um erro ocorreu, aí vai ele: " + resp.dbError);
        }
      })
      .catch(err => console.log(err));
  }

  render() {
    return (
      <div>
        <AdminHeader idUser={this.props.location.state.idUser} />
        <div className="containerCadastro">
          <h1>Alterar Localização de Item</h1>
          {this.state.redirect && (
            <Redirect
              to={{
                pathname: this.state.redirect,
                state: {
                  idUser: this.props.location.state.idUser,
                  isAdmin: true
                }
              }}
            />
          )}
          {
            <form
              className="form-group CadastroLocalizacao cadastroForm"
              noValidate
              autoComplete="off"
            >
              <label>Item</label>
              <input type="text" disabled className="form-control" ref="itemField" />
              <br></br>
              <label>Sala</label>
              <select className="form-control" ref="salaSelect">
                {this.rows()}
              </select>
              <br></br>
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.cadastrar}
              >
                Salvar
              </button>
            </form>
          }
        </div>
      </div>
    );
  }
}

export default App;

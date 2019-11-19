import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import "../../app.css";
import AdminHeader from "../../Headers/AdminHeader";
import urlDB from '../../dbURL';

class App extends Component {
  constructor(props) {
    super(props);
    this.cadastrar = this.cadastrar.bind(this);
    this.render = this.render.bind(this);
    this.state = {
      nextItemID: 0,
      redirect: false
    };
  }

  cadastrar() {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB + "novo/tipoitem", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      },
      body: JSON.stringify({
        descricao: this.refs.descField.value
      })
    })
      .then(response => response.json())
      .then(item => {
        if (Array.isArray(item)) {
          this.setState({ redirect: "/novo/item" });
        } else {
          alert("Um erro desconhecido ocorreu, aí vai ele: " + item.dbError);
        }
      })
      .catch(err => console.log(err));
  }

  render() {
    return (
      <div>
        <AdminHeader idUser={this.props.location.state.idUser} />
        <div className="containerCadastro">
          <h1>Cadastro de Categoria</h1>
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
              className="form-group CadastroCategoria cadastroForm"
              noValidate
              autoComplete="off"
            >
              <input
                type="text"
                placeholder="Descrição"
                className="form-control"
                ref="descField"
              />
              <br />
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.cadastrar}
              >
                Salvar
              </button>
              <br />
              <br />
              <button type="button" onClick={() => window.history.back()} className="btn btn-secondary">
                Voltar
                </button>
            </form>
          }
        </div>
      </div>
    );
  }
}

export default App;

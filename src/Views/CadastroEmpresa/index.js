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
      redirect: false
    };
  }

  componentDidMount() { }

  cadastrar() {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB + "novo/empresa", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      },
      body: JSON.stringify({
        nome: this.refs.nomeField.value
      })
    })
      .then(response => response.json())
      .then(item => {
        if (Array.isArray(item)) {
          this.setState({ redirect: "/novo/usuario" });
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
          <h1>Cadastro de Empresa</h1>
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
              className="form-group CadastroEmpresa cadastroForm"
              noValidate
              autoComplete="off"
            >
              <label>Nome</label>
              <input type="text" className="form-control" ref="nomeField" />
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

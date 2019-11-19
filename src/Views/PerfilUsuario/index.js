import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import "../../app.css";
import AdminHeader from "../../Headers/AdminHeader";
import UserHeader from "../../Headers/UserHeader";
import urlDB from '../../dbURL';
import Button from "@material-ui/core/Button";

class App extends Component {
  constructor(props) {
    super(props);
    this.cadastrar = this.cadastrar.bind(this);
    this.render = this.render.bind(this);
    this.verificaDados = this.verificaDados.bind(this);
    this.initDados = this.initDados.bind(this);
    this.state = {
      userInfo: 0,
      redirect: false,
    };
  }

  initDados(codiginho) {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB + "oneUserInfo", {
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
      .then(user => {
        if (Array.isArray(user)) {
          this.setState({ userInfo: user[0] }, () => {
            this.refs.nomeField.value = this.state.userInfo.nome;
            this.refs.empField.value = this.state.userInfo.empresaNome;
            this.refs.emailField.value = this.state.userInfo.email;
            this.refs.senhaField.value = this.state.userInfo.senha;
            this.refs.telefoneField.value = this.state.userInfo.telefone;
            this.refs.logradouroField.value = this.state.userInfo.logradouro;
            this.refs.numendField.value = this.state.userInfo.numeroend;
            this.refs.bairroField.value = this.state.userInfo.bairro;
          });
        } else {
          console.log(user.dbError);
        }
      })
      .catch(err => console.log(err));
  }

  componentDidMount() {
    this.initDados(this.props.location.state.idEUser);
  }

  verificaDados() {
    if (this.refs.nomeField.value === "") {
      return false;
    }
    if (this.refs.emailField.value === "") {
      return false;
    }
    if (this.refs.senhaField.value === "") {
      return false;
    }
    if (this.refs.telefoneField.value === "") {
      return false;
    }
    if (this.refs.logradouroField.value === "") {
      return false;
    }
    if (this.refs.numendField.value === "") {
      return false;
    }
    if (this.refs.bairroField.value === "") {
      return false;
    }
    return true;
  }

  cadastrar() {
    let token = JSON.parse(localStorage.getItem("token"));
    if (this.verificaDados()) {
      fetch(urlDB + "update/usuarioSimple", {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          authorization: token.acess_token,
          email: token.email
        },
        body: JSON.stringify({
          cod: this.state.userInfo.cod,
          nome: this.refs.nomeField.value,
          email: this.refs.emailField.value,
          senha: this.refs.senhaField.value,
          telefone: this.refs.telefoneField.value,
          logradouro: this.refs.logradouroField.value,
          numeroend: this.refs.numendField.value,
          bairro: this.refs.bairroField.value,
        })
      })
        .then(response => response.json())
        .then(user => {
          if (user === 1) {
            if (this.props.location.state.isAdmin) {
              this.setState({ redirect: "/homeAdmin" });
            } else {
              this.setState({ redirect: "/homeUser" });
            }

          } else {
            alert(
              "Um erro desconhecido ocorreu, aí vai ele: " + user.dbError
            );
          }
        })
        .catch(err => console.log(err));
    } else {
      alert("Preencha todos os campos!!!");
    }
  }

  render() {
    return (
      <div>
        {
          this.props.location.state.isAdmin &&
          <AdminHeader idUser={this.props.location.state.idUser} />
        }{
          !this.props.location.state.isAdmin &&
          <UserHeader idUser={this.props.location.state.idUser} />
        }

        <div className="containerCadastro">
          <h1>Minha Conta</h1>
          {this.state.redirect && (
            <Redirect
              to={{
                pathname: this.state.redirect,
                state: {
                  idUser: this.props.location.state.idUser,
                  isAdmin: this.props.location.state.isAdmin
                }
              }}
            />
          )}
          {
            <form
              className="form-group CadastroUser cadastroForm"
              noValidate
              autoComplete="off"
            >
              <br></br>
              <input
                type="text"
                placeholder="Nome"
                className="form-control"
                ref="nomeField"
              />
              <br></br>
              <input
                type="text"
                className="form-control"
                ref="empField" disabled />
              <br />
              <input
                type="email"
                placeholder="Email"
                className="form-control"
                ref="emailField"
              />
              <br></br>
              <input
                type="password"
                placeholder="Senha"
                className="form-control"
                ref="senhaField"
              />
              <br></br>
              <input
                type="text"
                placeholder="Telefone"
                className="form-control"
                ref="telefoneField"
              />
              <br></br>
              <input
                type="text"
                className="form-control"
                placeholder="Logradouro"
                ref="logradouroField"
              />
              <br></br>
              <input
                placeholder="Número"
                type="number"
                className="form-control"
                ref="numendField"
              />
              <br></br>
              <input
                type="text"
                placeholder="Bairro"
                className="form-control"
                ref="bairroField"
              />
              <br></br>
              <Button
                color='primary'
                size='medium'
                variant='contained'
                onClick={this.cadastrar}
              >
                Salvar
              </Button>
            </form>
          }
        </div>
      </div>
    );
  }
}

export default App;

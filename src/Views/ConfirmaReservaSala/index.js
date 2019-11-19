import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import "../../app.css";
import AdminHeader from "../../Headers/AdminHeader";
import UserHeader from "../../Headers/UserHeader";
import urlDB from '../../dbURL';

class App extends Component {
  constructor(props) {
    super(props);
    this.initDados = this.initDados.bind(this);
    this.reservar = this.reservar.bind(this);
    this.state = {
      redirect: false,
      sala: 0,
      usuario: 0,
      isAdmin: false,
      empresas: [],
      isLoading: false,
      userEmpresa: -1
    };
  }

  rows() {
    let r = [];
    this.state.empresas.forEach(emp => {
      if (emp.cod !== 0) {
        r.push(
          <option key={emp.cod} value={emp.cod}>
            {emp.nome}
          </option>
        );
      }
    });
    return r;
  }

  initDados() {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB+"oneSala", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      },
      body: JSON.stringify({
        cod: this.props.location.state.idSala
      })
    })
      .then(response => response.json())
      .then(salinha => {
        if (Array.isArray(salinha)) {
          this.refs.salaField.value = salinha[0].nome + " - " + salinha[0].cod;
          this.setState({ sala: salinha[0].cod });
        } else {
          console.log(salinha.dbError);
        }
      })
      .catch(err => console.log(err));
    if (this.props.location.state.dataInicio === " :00") {
      this.setState({ redirect: "/salas" });
    } else if (this.props.location.state.dataFim === " :00") {
      this.setState({ redirect: "/salas" });
    } else {
      this.refs.inicioField.value = this.props.location.state.dataInicio;
      this.refs.fimField.value = this.props.location.state.dataFim;
      this.setState({ usuario: this.props.location.state.idUser });
    }
  }

  componentDidMount() {
    let token = JSON.parse(localStorage.getItem("token"));
    this.setState({ isLoading: true });
    fetch(urlDB+"oneUser", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      },
      body: JSON.stringify({
        cod: this.props.location.state.idUser
      })
    })
      .then(response => response.json())
      .then(user => {
        if (Array.isArray(user)) {
          fetch(urlDB+"empresas")
            .then(response => response.json())
            .then(aas => {
              this.setState(
                {
                  userEmpresa: user[0].empresa,
                  empresas: aas,
                  usuario: this.props.location.state.idUser,
                  isAdmin: this.props.location.state.isAdmin
                },
                this.initDados()
              );
            });
        } else {
          console.log(user.dbError);
        }
      })
      .catch(err => console.log(err));
    this.setState({ isLoading: false });
  }

  reservar() {
    let empresita;
    let token = JSON.parse(localStorage.getItem("token"));
    if (this.state.isAdmin) {
      empresita = this.refs.selectEmpresa.value;
    } else {
      empresita = this.state.userEmpresa;
    }
    if (this.refs.obsField.value !== "") {
      let dataInicio = this.refs.inicioField.value,
        dataFim = this.refs.fimField.value;
      fetch(urlDB+"reservaSala", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          authorization: token.acess_token,
          email: token.email
        },
        body: JSON.stringify({
          sala: this.state.sala,
          datahorainicio: dataInicio,
          datahorafim: dataFim,
          usuario: this.state.usuario,
          empresa: empresita,
          obs: this.refs.obsField.value
        })
      })
        .then(response => response.json())
        .then(raesp => {
          if (Array.isArray(raesp)) {
            alert("Reservado com Sucesso!");
            this.setState({ redirect: "/salas" });
          } else {
            alert("Um erro ocorreu, aqui está ele: " + raesp.dbError);
          }
        })
        .catch(err => console.log(err));
    } else {
      alert("Informe a Observação!!!");
    }
  }

  render() {
    return (
      <div>
        {this.state.isLoading && <h1>Carregando Informações...</h1>}
        {!this.state.isLoading && (
          <div>
            {this.state.isAdmin && (
              <div>
                <AdminHeader idUser={this.props.location.state.idUser} />
              </div>
            )}
            {!this.state.isAdmin && (
              <div>
                <UserHeader idUser={this.props.location.state.idUser} />
              </div>
            )}
            <div className="containerCadastro">
              <h1>Confirmação de Reserva de Sala</h1>
              {this.state.redirect && (
                <Redirect
                  to={{
                    pathname: this.state.redirect,
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: this.state.isAdmin
                    }
                  }}
                />
              )}
              {
                <form
                  className="form-group ReservaSala cadastroForm"
                  noValidate
                  autoComplete="off"
                >
                  <row
                    style={{ width: "100%", float: "left", marginBottom: "3%" }}
                  >
                    <label style={{ width: "30%", float: "left" }}>Sala</label>
                    <input
                      type="text"
                      style={{ width: "70%", float: "left" }}
                      className="form-control"
                      ref="salaField"
                      disabled
                    />
                  </row>
                  <row
                    style={{ width: "100%", float: "left", marginBottom: "3%" }}
                  >
                    <label style={{ width: "30%", float: "left" }}>
                      Data de Início
                    </label>
                    <input
                      type="datetime"
                      style={{ width: "70%", float: "left" }}
                      className="form-control"
                      ref="inicioField"
                      disabled
                    />
                  </row>
                  <row
                    style={{ width: "100%", float: "left", marginBottom: "3%" }}
                  >
                    <label style={{ width: "30%", float: "left" }}>
                      Data de Fim
                    </label>
                    <input
                      type="datetime"
                      style={{ width: "70%", float: "left" }}
                      className="form-control"
                      ref="fimField"
                      disabled
                    />
                  </row>
                  {this.state.isAdmin && (
                    <div>
                      <br />
                      <select className="form-control" ref="selectEmpresa">
                        {this.rows()}
                      </select>
                    </div>
                  )}
                  <br></br>
                  <input
                    type="text"
                    placeholder="Observação"
                    className="form-control"
                    ref="obsField"
                  />
                  <br></br>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.reservar}
                  >
                    Confirmar Reserva
                  </button>
                </form>
              }
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default App;

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
      item: 0,
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

  initDados(itemCod) {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB+"oneItem", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      },
      body: JSON.stringify({
        cod: itemCod
      })
    })
      .then(response => response.json())
      .then(itemzinho => {
        if (Array.isArray(itemzinho)) {
          this.refs.itemField.value =
            itemzinho[0].descricao + " - " + itemzinho[0].cod;
          this.setState({ item: itemzinho[0].cod });
        } else {
          console.log(itemzinho.dbError);
        }
      })
      .catch(err => console.log(err));
    this.refs.inicioField.valueAsDate = this.props.location.state.dataInicio;
    this.refs.fimField.valueAsDate = this.props.location.state.dataFim;
    this.refs.indefCbox.checked = this.props.location.state.undefined;
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
          fetch(urlDB+"empresas", {
            headers: {
              "Content-Type": "application/json",
              authorization: token.acess_token,
              email: token.email
            }
          })
            .then(response => response.json())
            .then(aas => {
              this.setState(
                {
                  userEmpresa: user[0].empresa,
                  empresas: aas,
                  usuario: this.props.location.state.idUser,
                  isAdmin: this.props.location.state.isAdmin
                },
                this.initDados(this.props.location.state.idEditar)
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
        dataFim;
      if (this.refs.indefCbox.checked) {
        dataFim = "0";
      } else {
        dataFim = this.refs.fimField.value;
      }
      fetch(urlDB+"reserva", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          authorization: token.acess_token,
          email: token.email
        },
        body: JSON.stringify({
          datainicio: dataInicio,
          datafim: dataFim,
          usuario: this.state.usuario,
          item: this.state.item,
          empresa: empresita,
          obs: this.refs.obsField.value
        })
      })
        .then(response => response.json())
        .then(item => {
          if (Array.isArray(item)) {
            alert("Reservado com Sucesso!");
            this.setState({ redirect: "/itens" });
          } else {
            alert("Um erro ocorreu, aqui está ele: " + item.dbError);
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
              <h1>Confirmação de Reserva</h1>
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
                  className="form-group Reserva cadastroForm"
                  noValidate
                  autoComplete="off"
                >
                  <row
                    style={{ width: "100%", float: "left", marginBottom: "3%" }}
                  >
                    <label style={{ width: "30%", float: "left" }}>Item</label>
                    <input
                      type="text"
                      style={{ width: "70%", float: "left" }}
                      className="form-control"
                      ref="itemField"
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
                      type="date"
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
                      style={{ width: "70%", float: "left" }}
                      type="date"
                      className="form-control"
                      ref="fimField"
                      disabled
                    />
                  </row>
                  <row
                    style={{ width: "100%", float: "left", marginBottom: "3%" }}
                  >
                    <label>
                      <input type="checkbox" disabled ref="indefCbox" />{" "}
                      Indefinido
                    </label>
                  </row>
                  {this.state.isAdmin && (
                    <div>
                      <br />
                      <select
                        style={{
                          width: "100%",
                          float: "left",
                          marginBottom: "3%"
                        }}
                        className="form-control"
                        ref="selectEmpresa"
                      >
                        {this.rows()}
                      </select>
                    </div>
                  )}
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
                    <br></br>
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

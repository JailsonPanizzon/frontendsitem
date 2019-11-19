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
    this.verificaDados = this.verificaDados.bind(this);
    this.desativaCodigoInput = this.desativaCodigoInput.bind(this);
    this.state = {
      nextSalaID: 0,
      editandoSala: false,
      redirect: false,
      useCodigo: false
    };
  }

  componentDidMount() {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB+"nextSalaID", {
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      }
    })
      .then(response => response.json())
      .then(codigo => this.setState({ nextSalaID: codigo[0].max + 1 }));
    this.refs.dispCbox.checked = true;
    if (typeof this.props.location.state.idSala !== "undefined") {
      this.initDados(this.props.location.state.idSala);
    }
  }

  initDados(codiginho) {
    let token = JSON.parse(localStorage.getItem("token"));
    let salinha;
    fetch(urlDB+"oneSala", {
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
      .then(sala => {
        if (Array.isArray(sala)) {
          salinha = sala[0];
          this.refs.codField.value = salinha.cod;
          this.refs.descField.value = salinha.descricao;
          this.refs.nomeField.value = salinha.nome;
          this.refs.dispCbox.checked = salinha.disponivel;
          this.setState({ editandoSala: salinha.cod });
        } else {
          console.log(sala.dbError);
        }
      })
      .catch(err => console.log(err));
  }

  verificaDados() {
    if (this.refs.codField.value === "") {
      if (!this.refs.randomCbox.checked) {
        return false;
      }
    }
    if (this.refs.nomeField.value === "") {
      return false;
    }
    if (this.refs.descField.value === "") {
      return false;
    }
    return true;
  }

  cadastrar() {
    let token = JSON.parse(localStorage.getItem("token"));
    if (this.state.editandoSala) {
      if (this.verificaDados()) {
        let codiginho = this.refs.codField.value;
        if (this.refs.randomCbox.checked) {
          codiginho = this.state.nextSalaID;
        }
        fetch(urlDB+"update/sala", {
          method: "put",
          headers: {
            "Content-Type": "application/json",
            authorization: token.acess_token,
            email: token.email
          },
          body: JSON.stringify({
            oldcod: this.state.editandoSala,
            cod: codiginho,
            nome: this.refs.nomeField.value,
            descricao: this.refs.descField.value,
            disponivel: this.refs.dispCbox.checked
          })
        })
          .then(response => response.json())
          .then(sala => {
            if (sala === 1) {
              this.setState({ redirect: "/salas" });
            } else {
              if (sala.dbError === "ja existe") {
                alert(
                  "Uma sala com este código já existe no banco de dados, tente outro ou gere um código automático"
                );
              } else {
                alert(
                  "Um erro desconhecido ocorreu, aí vai ele: " + sala.dbError
                );
              }
            }
          })
          .catch(err => console.log(err));
      } else {
        alert("Preencha todos os campos!!!");
      }
    } else {
      if (this.verificaDados()) {
        let codiginho = this.refs.codField.value;
        if (this.refs.randomCbox.checked) {
          codiginho = this.state.nextSalaID;
        }
        fetch(urlDB+"novo/sala", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            authorization: token.acess_token,
            email: token.email
          },
          body: JSON.stringify({
            cod: codiginho,
            nome: this.refs.nomeField.value,
            descricao: this.refs.descField.value,
            disponivel: this.refs.dispCbox.checked
          })
        })
          .then(response => response.json())
          .then(sala => {
            if (Array.isArray(sala)) {
              this.setState({ redirect: "/salas" });
            } else {
              if (sala.dbError === "ja existe") {
                alert(
                  "Uma sala com este código já existe no banco de dados, tente outro ou gere um código automático"
                );
              } else {
                alert(
                  "Um erro desconhecido ocorreu, aí vai ele: " + sala.dbError
                );
              }
            }
          })
          .catch(err => console.log(err));
      } else {
        alert("Preencha todos os campos!!!");
      }
    }
  }
  desativaCodigoInput() {
    this.setState({ useCodigo: !this.state.useCodigo });
  }
  render() {
    return (
      <div>
        <AdminHeader idUser={this.props.location.state.idUser} />
        <div className="containerCadastro">
          <h1>Cadastro de Sala</h1>
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
              className="form-group CadastroSala cadastroForm"
              noValidate
              autoComplete="off"
            >
              <input
                type="number"
                placeholder="Código"
                disabled={this.state.useCodigo}
                className="form-control"
                ref="codField"
              />
              <label>
                <input
                  type="checkbox"
                  ref="randomCbox"
                  onChange={this.desativaCodigoInput}
                />{" "}
                Código Automático
              </label>
              <br></br>
              <input
                type="text"
                placeholder="Nome"
                className="form-control"
                ref="nomeField"
              />
              <br></br>
              <textarea
                rows={5}
                type="text"
                placeholder="Descrição"
                className="form-control"
                ref="descField"
              />
              <br></br>
              <label>
                <input type="checkbox" ref="dispCbox" /> Disponível para
                Reservas
              </label>
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

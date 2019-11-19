import React, { Component } from "react";
import { Redirect, Link } from "react-router-dom";
import "../../app.css";
import AdminHeader from "../../Headers/AdminHeader";
import urlDB from '../../dbURL';

class App extends Component {
  constructor(props) {
    super(props);
    this.cadastrar = this.cadastrar.bind(this);
    this.render = this.render.bind(this);
    this.verificaDados = this.verificaDados.bind(this);
    this.initDados = this.initDados.bind(this);
    this.state = {
      empresas: [],
      editandoUser: false,
      redirect: false
    };
  }

  initDados(codiginho) {
    let userzinho;
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB+"oneUser", {
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
          userzinho = user[0];
          this.refs.nomeField.value = userzinho.nome;
          this.refs.emailField.value = userzinho.email;
          this.refs.senhaField.value = userzinho.senha;
          this.refs.empresaSelect.value = userzinho.empresa;
          this.refs.telefoneField.value = userzinho.telefone;
          this.refs.logradouroField.value = userzinho.logradouro;
          this.refs.numendField.value = userzinho.numeroend;
          this.refs.bairroField.value = userzinho.bairro;
          this.refs.cidadeField.value = userzinho.cidade;
          this.refs.UFSelect.value = userzinho.uf;
          this.refs.adminCbox.checked = userzinho.isadmin;
          this.setState({ editandoUser: userzinho.cod });
        } else {
          console.log(user.dbError);
        }
      })
      .catch(err => console.log(err));
  }

  componentDidMount() {
    this.loadEmpresas();
    if (typeof this.props.location.state.idEUser !== "undefined") {
      this.initDados(this.props.location.state.idEUser);
    }
  }

  loadEmpresas() {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB+"empresas",{
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      }
    })
      .then(response => response.json())
      .then(tipos => this.setState({ empresas: tipos }));
  }

  rows() {
    let r = [];
    r.push(
      <option key={-1} value={-1}>
        Empresa
      </option>
    );
    this.state.empresas.forEach(empresa => {
      r.push(
        <option key={empresa.cod} value={empresa.cod}>
          {empresa.nome}
        </option>
      );
    });
    return r;
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
    if (this.refs.cidadeField.value === "") {
      return false;
    }
    if (parseInt(this.refs.empresaSelect.value) === -1) {
      return false;
    }
    return true;
  }

  cadastrar() {
    let token = JSON.parse(localStorage.getItem("token"));
    if (this.state.editandoUser) {
      if (this.verificaDados()) {
        let empresinha = this.refs.empresaSelect.value;
        if (this.refs.adminCbox.checked) {
          empresinha = 0;
        }
        fetch(urlDB+"update/usuario", {
          method: "put",
          headers: {
            "Content-Type": "application/json",
            authorization: token.acess_token,
            email: token.email
          },
          body: JSON.stringify({
            cod: this.state.editandoUser,
            nome: this.refs.nomeField.value,
            email: this.refs.emailField.value,
            senha: this.refs.senhaField.value,
            telefone: this.refs.telefoneField.value,
            isadmin: this.refs.adminCbox.checked,
            logradouro: this.refs.logradouroField.value,
            numeroend: this.refs.numendField.value,
            bairro: this.refs.bairroField.value,
            cidade: this.refs.cidadeField.value,
            uf: this.refs.UFSelect.value,
            empresa: empresinha
          })
        })
          .then(response => response.json())
          .then(user => {
            if (user === 1) {
              this.setState({ redirect: "/usuarios" });
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
    } else {
      if (this.verificaDados()) {
        let empresinha = this.refs.empresaSelect.value;
        if (this.refs.adminCbox.checked) {
          empresinha = 0;
        }
        fetch(urlDB+"novo/usuario", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            authorization: token.acess_token,
            email: token.email
          },
          body: JSON.stringify({
            nome: this.refs.nomeField.value,
            email: this.refs.emailField.value,
            senha: this.refs.senhaField.value,
            telefone: this.refs.telefoneField.value,
            isadmin: this.refs.adminCbox.checked,
            logradouro: this.refs.logradouroField.value,
            numeroend: this.refs.numendField.value,
            bairro: this.refs.bairroField.value,
            cidade: this.refs.cidadeField.value,
            uf: this.refs.UFSelect.value,
            empresa: empresinha
          })
        })
          .then(response => response.json())
          .then(user => {
            if (Array.isArray(user)) {
              this.setState({ redirect: "/usuarios" });
            } else {
              alert(
                "Um erro ocorreu, esta é a mensagem dele para você: " +
                  user.dbError
              );
            }
          })
          .catch(err => console.log(err));
      } else {
        alert("Preencha todos os campos!!!");
      }
    }
  }

  render() {
    return (
      <div>
        <AdminHeader idUser={this.props.location.state.idUser} />
        <div className="containerCadastro">
          <h1>Cadastro de Usuário</h1>
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
              <row style={{ width: "100%", float: "left" }}>
                <select
                  className="form-control"
                  ref="empresaSelect"
                  style={{ width: "90%", float: "left", marginBottom: "5%" }}
                >
                  {this.rows()}
                </select>{" "}
                <Link
                  to={{
                    pathname: "/novo/empresa",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: true
                    }
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: "10%", float: "left" }}
                  >
                    +
                  </button>
                </Link>
              </row>

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
              <input
                type="text"
                placeholder="Cidade"
                className="form-control"
                ref="cidadeField"
              />
              <br></br>
              <select className="form-control" ref="UFSelect">
                <option value="PR">Paraná</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="RS">Rio Grande do Sul</option>
              </select>
              <br></br>
              <label>
                <input type="checkbox" ref="adminCbox" /> Administrador
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

import React, { Component } from "react";
import { Redirect, Link } from "react-router-dom";
import "../../app.css";
import AdminHeader from "../../Headers/AdminHeader";
import urlDB from "../../dbURL";

class App extends Component {
  constructor(props) {
    super(props);
    this.cadastrar = this.cadastrar.bind(this);
    this.render = this.render.bind(this);
    this.verificaDados = this.verificaDados.bind(this);
    this.desativaCodigoInput = this.desativaCodigoInput.bind(this);

    this.state = {
      tipoitens: [],
      nextItemID: 0,
      editandoItem: false,
      redirect: false,
      useCodigo: false
    };
  }

  componentDidMount() {
    this.loadTipoItens();
    this.refs.ativoCbox.checked = true;
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB + "nextItemID", {
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      }
    }
    )
      .then(response => response.json())
      .then(codigo => this.setState({ nextItemID: codigo[0].max + 1 }));
    if (typeof this.props.location.state.idEditar !== "undefined") {
      this.initDados(this.props.location.state.idEditar);
    }
  }

  loadTipoItens() {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB + "tipoitens", {
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      }
    })
      .then(response => response.json())
      .then(tipos => this.setState({ tipoitens: tipos }));
  }

  rows() {
    let r = [];
    r.push(
      <option key={-1} value={-1}>
        Categoria
      </option>
    );
    this.state.tipoitens.forEach(item => {
      r.push(
        <option key={item.cod} value={item.cod}>
          {item.descricao}
        </option>
      );
    });
    return r;
  }
  desativaCodigoInput() {
    this.setState({ useCodigo: !this.state.useCodigo });
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
          this.refs.codField.value = itemzinho.cod;
          this.refs.descField.value = itemzinho.descricao;
          this.refs.categoriaSelect.value = itemzinho.tipoitem;
          this.refs.marcaField.value = itemzinho.marca;
          this.refs.ativoCbox.checked = itemzinho.ativo;
          this.setState({ editandoItem: itemzinho.cod });
        } else {
          console.log(item.dbError);
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
    if (
      this.refs.descField.value === "" ||
      parseInt(this.refs.categoriaSelect.value) === -1
    ) {
      return false;
    }
    return true;
  }

  cadastrar() {
    let token = JSON.parse(localStorage.getItem("token"));
    if (this.state.editandoItem) {
      if (this.verificaDados()) {
        let codiginho = this.refs.codField.value;
        if (this.refs.randomCbox.checked) {
          codiginho = this.state.nextItemID;
        }
        fetch(urlDB + "update/item", {
          method: "put",
          headers: {
            "Content-Type": "application/json",
            authorization: token.acess_token,
            email: token.email
          },
          body: JSON.stringify({
            oldcod: this.state.editandoItem,
            cod: codiginho,
            descricao: this.refs.descField.value,
            tipoitem: this.refs.categoriaSelect.value,
            marca: this.refs.marcaField.value,
            ativo: this.refs.ativoCbox.checked
          })
        })
          .then(response => response.json())
          .then(item => {
            if (item === 1) {
              this.setState({ redirect: "/itens" });
            } else {
              if (item.dbError === "ja existe") {
                alert(
                  "Um item com este código já existe no banco de dados, tente outro ou gere um código automático"
                );
              } else {
                alert(
                  "Um erro desconhecido ocorreu, aí vai ele: " + item.dbError
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
          codiginho = this.state.nextItemID;
        }
        fetch(urlDB + "novo/item", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            authorization: token.acess_token,
            email: token.email
          },
          body: JSON.stringify({
            cod: codiginho,
            descricao: this.refs.descField.value,
            tipoitem: this.refs.categoriaSelect.value,
            marca: this.refs.marcaField.value,
            ativo: this.refs.ativoCbox.checked
          })
        })
          .then(response => response.json())
          .then(item => {
            if (Array.isArray(item)) {
              this.setState({ redirect: "/itens" });
            } else {
              if (item.dbError === "ja existe") {
                alert(
                  "Um item com este código já existe no banco de dados, tente outro ou gere um código automático"
                );
              } else {
                alert(
                  "Um erro desconhecido ocorreu, aí vai ele: " + item.dbError
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

  render() {
    return (
      <div>
        <AdminHeader idUser={this.props.location.state.idUser} />
        <div className="containerCadastro">
          <h1>Cadastro de Item</h1>
          <br></br>
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
              className="form-group CadastroItem cadastroForm"
              noValidate
              autoComplete="off"
            >
              <row
                style={{
                  width: "100%",
                  float: "left",
                  marginBottom: "3%"
                }}
              >
                <input
                  style={{ width: "72%", float: "left" }}
                  type="number"
                  placeholder="Código"
                  disabled={this.state.useCodigo}
                  className="form-control"
                  ref="codField"
                />
                <label
                  style={{
                    float: "left",
                    marginLeft: "3%",
                    marginTop: "2%",
                    width: "25%",
                    textAlign: "right",
                    fontSize: 12,
                    verticalAlign: "middle"
                  }}
                >
                  <input
                    style={{
                      alignSelf: "right",
                      float: "left",
                      marginRight: "3%",
                      marginTop: "2%"
                    }}
                    type="checkbox"
                    ref="randomCbox"
                    onChange={this.desativaCodigoInput}
                  />
                  Código Automático
                </label>
              </row>
              <row
                style={{
                  width: "100%",
                  float: "left",
                  marginBottom: "3%"
                }}
              >
                <select
                  className="form-control"
                  ref="categoriaSelect"
                  style={{ width: "90%", float: "left" }}
                >
                  {this.rows()}
                </select>{" "}
                <Link
                  to={{
                    pathname: "/novo/categoria",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: true
                    }
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ widht: "7%" }}
                  >
                    +
                  </button>
                </Link>
              </row>
              <br></br>
              <input
                type="text"
                placeholder="Marca"
                className="form-control"
                ref="marcaField"
              />
              <br></br>
              <textarea
                rows={5}
                autoCapitalize="on"
                type="text"
                placeholder="Descrição"
                className="form-control"
                ref="descField"
              />
              <br></br>
              <label>
                <input type="checkbox" ref="ativoCbox" /> Ativo
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

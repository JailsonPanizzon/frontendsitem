import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import "../../app.css";
import urlDB from '../../dbURL';
import { Button } from '@material-ui/core'

class App extends Component {
  constructor(props) {
    super(props);
    this.cadastrar = this.cadastrar.bind(this);
    this.render = this.render.bind(this);
    this.verificaDados = this.verificaDados.bind(this);
    this.state = {
      empresas: [],
      redirect: false
    };
  }

  componentDidMount() {
    this.loadEmpresas();
  }

  loadEmpresas() {
    fetch(urlDB + "empresasCadastro")
      .then(response => response.json())
      .then(tipos => {
        this.setState({ empresas: tipos })
      });
  }

  rows() {
    let r = [];
    r.push(
      <option key={-1} value={-1}>
        Selecione uma Empresa
      </option>
    );
    this.state.empresas.forEach(empresa => {
      if (empresa.cod > 0) {
        r.push(
          <option key={empresa.cod} value={empresa.cod}>
            {empresa.nome}
          </option>
        );
      }

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
    fetch(urlDB + "checkEmail", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: this.refs.emailField.value,
      })
    })
      .then(response => response.json())
      .then(resp => {
        if (!resp.resultado) {
          let res = this.verificaDados();
          if (res) {
            fetch(urlDB + "novo/usuarioPend", {
              method: "post",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                nome: this.refs.nomeField.value,
                email: this.refs.emailField.value,
                senha: this.refs.senhaField.value,
                telefone: this.refs.telefoneField.value,
                logradouro: this.refs.logradouroField.value,
                numeroend: this.refs.numendField.value,
                bairro: this.refs.bairroField.value,
                cidade: this.refs.cidadeField.value,
                uf: this.refs.UFSelect.value,
                empresa: this.refs.empresaSelect.value,
              })
            })
              .then(response => response.json())
              .then(user => {
                if (Array.isArray(user)) {
                  alert("Cadastro realizado com Sucesso!\nAguarde a aprovação de seu Login...");
                  this.setState({ redirect: "/" });
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
        } else {
          alert("Email já cadastrado!");
        }
      })
      .catch(err => console.log(err));

  }

  render() {
    return (
      <div>
        <div className="containerCadastro">
          <br />
          <img src="../images/Banner.png" height="100" alt="bannerLogo"></img>
          <br /><br />
          <h1>Cadastre-se</h1>
          {this.state.redirect && (
            <Redirect
              to={{
                pathname: this.state.redirect,
              }}
            />
          )}
          {
            <form
              className="form-group CadastroUser cadastroForm"
              noValidate
              autoComplete="off"
            >
              <input
                type="text"
                placeholder="Nome"
                className="form-control"
                ref="nomeField"
              />
              <br></br>
              <select
                className="form-control"
                ref="empresaSelect"
              >
                {this.rows()}
              </select>{" "}
              <br></br>
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
              <Button
                color='secondary'
                size='medium'
                variant='contained'
                onClick={this.cadastrar}>
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

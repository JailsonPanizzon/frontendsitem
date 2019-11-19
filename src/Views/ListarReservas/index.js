import React, { Component } from "react";
import { Link } from "react-router-dom";
import AdminHeader from "../../Headers/AdminHeader";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import "react-dropdown/style.css";
import { KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import CircularProgress from "@material-ui/core/CircularProgress";
import { SimpleTable } from "../widgets/table.js";
import urlDB from '../../dbURL';

class App extends Component {
  constructor(props) {
    super(props);
    this.getData = this.getData.bind(this);
    this.loadReservas = this.loadReservas.bind(this);
    this.getUsername = this.getUsername.bind(this);
    this.inativaReserva = this.inativaReserva.bind(this);
    let data1 = new Date();
    let data2 = new Date();
    data2.setDate(new Date().getDate() + 1);
    this.state = {
      itens: [],
      users: [],
      empresas: [],
      isLoading: false,
      isAdmin: false,
      dateInit: data1,
      dateEnd: data2,
      reservas: [],
      linhasTabela: [],
      atrasadas: [],
    };
  }

  getData() {
    let token = JSON.parse(localStorage.getItem("token"));
    this.setState({ isLoading: true });
    fetch(urlDB + "simpleItens", {
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      }
    })
      .then(response => response.json())
      .then(item => {
        fetch(urlDB + "usuarios", {
          headers: {
            "Content-Type": "application/json",
            authorization: token.acess_token,
            email: token.email
          }
        })
          .then(response => response.json())
          .then(usu => {
            fetch(urlDB + "empresas", {
              headers: {
                "Content-Type": "application/json",
                authorization: token.acess_token,
                email: token.email
              }
            })
              .then(response => response.json())
              .then(emp => {
                fetch(urlDB + "reservasAtrasadas", {
                  headers: {
                    "Content-Type": "application/json",
                    authorization: token.acess_token,
                    email: token.email
                  }
                })
                  .then(response => response.json())
                  .then(at => {
                    this.setState({ itens: item, users: usu, empresas: emp, atrasadas: at })
                  });
              });
          });
      });
  }

  componentDidMount() {
    this.getData();
    this.setState({ isAdmin: this.props.location.state.isAdmin });
    this.refs.cboxEmpresa.checked = true;
  }

  inativaReserva(codinho) {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB + 'inativa/reserva', {
      method: 'put',
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      },
      body: JSON.stringify({
        cod: codinho,
      })
    }).then(response => response.json()).then(resposta => {
      if (resposta === 1) {
        let i = 0, array = this.state.reservas;
        for (i = 0; i < array.length; i++) {
          if (array[i].cod === codinho) {
            array.splice(i, 1);
          }
        }
        this.setState({ reservas: array }, () => {
          this.setState({ linhasTabela: this.rows() })
        });
      } else {
        alert("Deu ruim, aqui deixo a você um erro de presente: " + resposta.dbError);
        console.log(resposta.dbError);
      }
    }).catch(err => console.log(err));
  }

  loadReservas() {
    let token = JSON.parse(localStorage.getItem("token"));
    let dataFinal = this.state.dateEnd.toLocaleDateString();
    if (this.refs.cboxIndef.checked) {
      dataFinal = null;
    }
    if (this.refs.cboxEmpresa.checked) {
      fetch(urlDB + "reservasByEmpresa", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          authorization: token.acess_token,
          email: token.email
        },
        body: JSON.stringify({
          empresa: this.refs.empresasSelect.value,
          datainicio: this.state.dateInit.toLocaleDateString(),
          datafim: dataFinal
        })
      })
        .then(response => response.json())
        .then(resp => {
          if (Array.isArray(resp)) {
            this.setState({ reservas: resp }, () => {
              this.setState({ linhasTabela: this.rows() })
            });
          } else {
            this.setState({ reservas: [] }, () => {
              this.setState({ linhasTabela: [] })
            });
            alert("Nenhuma reserva encontrada com as opções desejadas!");
          }
        })
        .catch(err => console.log(err));
    } else {
      fetch(urlDB + "reservasByPeriodo", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          authorization: token.acess_token,
          email: token.email
        },
        body: JSON.stringify({
          datainicio: this.state.dateInit.toLocaleDateString(),
          datafim: dataFinal,
        })
      })
        .then(response => response.json())
        .then(resp => {
          if (Array.isArray(resp)) {
            this.setState({ reservas: resp }, () => {
              this.setState({ linhasTabela: this.rows() })
            });
          } else {
            this.setState({ reservas: [] }, () => {
              this.setState({ linhasTabela: [] })
            });
            alert("Nenhuma reserva encontrada com as opções desejadas!");
          }
        })
        .catch(err => console.log(err));
    }
  }

  getEmpresaNome(codEmpresa) {
    let resp;
    this.state.empresas.forEach(emp => {
      if (codEmpresa === emp.cod) {
        resp = emp.cod + " - " + emp.nome;
      }
    })
    return resp;
  }

  getUsername(codUser) {
    let resp;
    this.state.users.forEach(user => {
      if (codUser === user.cod) {
        resp = user.nome;
      }
    })
    return resp;
  }

  getDataBonita(date) {
    if (date === null) {
      return "Indefinido"
    }
    let d = new Date(date);
    let dia = d.getDate().toString();
    if (dia < 10) {
      dia = '0' + dia;
    }
    let mes = d.getMonth().toString();
    mes = parseInt(mes, 10) + 1;
    if (mes < 10) {
      mes = '0' + mes;
    }
    let r = dia + "/" + mes + "/" + d.getFullYear().toString();
    return r;
  }

  assembleActions(reserva) {
    let s = [], i = false;
    if (Array.isArray(this.state.atrasadas)) {
      this.state.atrasadas.forEach(at => {
        if (at.cod === reserva.cod) {
          i = true;
        }
      })
    }
    if (i) {
      s.push(
        <CardActions>
          <div>
            <Button variant="contained" size="small" color="secondary">
              Atrasada
              </Button>
            <Button size="small" color="primary" onClick={(e) => { if (window.confirm('Marcar reserva como Devolvida?')) this.inativaReserva(reserva.cod) }}>
              Marcar como Devolvida
              </Button>
          </div>
        </CardActions>
      );
    } else {
      s.push(
        <CardActions>
          <div>
            <Button size="small" color="primary" onClick={(e) => { if (window.confirm('Marcar reserva como Devolvida?')) this.inativaReserva(reserva.cod) }}>
              Marcar como Devolvida
              </Button>
          </div>
        </CardActions>
      );
    }
    return s;
  }

  rows() {
    let r = [];
    if (Array.isArray(this.state.reservas)) {
      this.state.reservas.forEach(res => {
        r.push(
          this.createData(
            this.getItemDesc(res.item),
            this.getDataBonita(res.datainicio),
            this.getDataBonita(res.datafim),
            this.getEmpresaNome(res.empresa),
            this.getUsername(res.usuario),
            res.obs,
            this.assembleActions(res)
          )
        );
      });
    }

    return r;
  }

  getItemDesc(itemCod) {
    let resp = [];
    this.state.itens.forEach(item => {
      if (itemCod === item.cod) {
        resp.push(
          <Link
            to={{
              pathname: "/novo/item",
              state: {
                idEditar: itemCod,
                idUser: this.props.location.state.idUser
              }
            }}
          >{item.cod + " - " + item.descricao}</Link>
        );
      }
    })
    return resp;
  }

  returnEmpresas() {
    let r = [];
    this.state.empresas.forEach(emp => {
      if (emp.cod !== 0) {
        r.push(
          <option key={emp.cod} value={emp.cod}>{emp.nome}</option>
        );
      }
    });
    return r;
  }

  createData(item, inicio, fim, empresa, usuario, obs, acao) {
    return [item, inicio, fim, empresa, usuario, obs, acao];
  }

  onChangeEnd(end) {
    if (end < this.state.dateInit) {
      let date = new Date(end);
      date.setDate(end.getDate() - 1);
      this.setState({ dateInit: date, dateEnd: end });
    } else {
      this.setState({ dateEnd: end });
    }
  }

  onChangeInit(init) {
    if (this.state.dateEnd < init) {
      let date = new Date(init);
      date.setDate(init.getDate() + 1);
      this.setState({ dateInit: init, dateEnd: date });
    } else {
      this.setState({ dateInit: init });
    }
  }

  render() {
    return (
      <div>
        <div>
          <AdminHeader idUser={this.props.location.state.idUser} />
        </div>
        <div className="Container">
          <div className="Lista">
            <div className="filtros">
              <div className='itemFiltro' style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/itens",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: true
                    }
                  }}
                >
                  <Button fullWidth variant="contained" color="primary">
                    Reservar Item
                    </Button>
                </Link>
              </div>
              <div
                className="itemFiltro"
                style={{
                  textAlign: "center",
                  fontFamily: "Roboto,Helvetica,Arial,sans-serif"
                }}
              >
                Opções de Listagem
              </div>

              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <div className="itemFiltro">
                  <KeyboardDatePicker
                    margin="normal"
                    id="date-picker-dialog"
                    label="Data Inicial"
                    format="dd/MM/yyyy"
                    value={this.state.dateInit}
                    onChange={this.onChangeInit.bind(this)}
                    KeyboardButtonProps={{
                      "aria-label": "change date"
                    }}
                  />
                </div>
                <div className="itemFiltro">
                  <KeyboardDatePicker
                    margin="normal"
                    id="date-picker-dialog"
                    label="Data Final"
                    format="dd/MM/yyyy"
                    value={this.state.dateEnd}
                    onChange={this.onChangeEnd.bind(this)}
                    KeyboardButtonProps={{
                      "aria-label": "change date"
                    }}
                  />
                </div>
                <div className='itemFiltro' style={{ textAlign: "center" }}>
                  <input type='checkbox' ref='cboxIndef' /> Buscar somente pelo Início
                <br />
                </div>
              </MuiPickersUtilsProvider>
              <div className="itemFiltro">
                Empresa: <select ref="empresasSelect">
                  {this.returnEmpresas()}
                </select>
              </div>
              <div className='itemFiltro' style={{ textAlign: "center" }}>
                <input type='checkbox' ref='cboxEmpresa' /> Pesquisar por Empresa
                <br />
              </div>
              <div className='itemFiltro' style={{ textAlign: "center" }}>
                <br />
                <Button variant="contained" color="secondary" onClick={this.loadReservas}>
                  Carregar
                    </Button>
                <br />
              </div>
            </div>
            <div className="itens">
              {this.state.itens.length < 1 ? (
                <div className="loading">
                  <CircularProgress disableShrink />{" "}
                </div>
              ) : (
                  SimpleTable(this.state.linhasTabela, [
                    "Item",
                    "Início",
                    "Fim",
                    "Empresa",
                    "Usuário",
                    "Observação",
                    "Ação"
                  ])
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

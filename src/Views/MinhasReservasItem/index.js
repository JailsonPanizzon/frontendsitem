import React, { Component } from "react";
import { Link } from "react-router-dom";
import UserHeader from "../../Headers/UserHeader";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import "react-dropdown/style.css";
import { KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import CircularProgress from "@material-ui/core/CircularProgress";
import { SimpleTable } from "../widgets/table.js";
import urlDB from '../../dbURL';
import AddAlarmIcon from '@material-ui/icons/AddAlarm';

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
      isLoading: false,
      isAdmin: false,
      dateInit: data1,
      dateEnd: data2,
      reservas: [],
      linhasTabela: [],
      atrasadas: [],
      empresaCod: -1,
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
            fetch(urlDB + "reservasAtrasadas", {
              headers: {
                "Content-Type": "application/json",
                authorization: token.acess_token,
                email: token.email
              }
            })
              .then(response => response.json())
              .then(at => {
                fetch(urlDB + 'empresaNameByUser', {
                  method: 'post',
                  headers: {
                    "Content-Type": "application/json",
                    authorization: token.acess_token,
                    email: token.email
                  },
                  body: JSON.stringify({
                    user: this.props.location.state.idUser,
                  })
                }).then(response => response.json()).then(resposta => {
                  this.setState({ itens: item, users: usu, atrasadas: at, empresaCod: resposta[0].cod });
                }).catch(err => console.log(err));
              });
          });
      });
  }

  componentDidMount() {
    this.getData();
    this.setState({ isAdmin: this.props.location.state.isAdmin });
    this.refs.cboxIndef.checked = true;
  }

  inativaReserva(codinho) {
    let token = JSON.parse(localStorage.getItem("token"));
    let result = window.confirm("Tem certeza que deseja cancelar esta reserva?");
    if (result) {
      fetch(urlDB + 'cancela/reserva', {
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
  }

  loadReservas() {
    let token = JSON.parse(localStorage.getItem("token"));
    let dataFinal = this.state.dateEnd.toLocaleDateString();
    if (this.refs.cboxIndef.checked) {
      dataFinal = null;
    }
    fetch(urlDB + "reservasEmpresaPeriodo", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      },
      body: JSON.stringify({
        empresa: this.state.empresaCod,
        datainicio: this.state.dateInit.toLocaleDateString(),
        datafim: dataFinal,
        status: this.refs.statusSelect.value,
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

  getStatusName(st, at) {
    if (st === 1 && !at) {
      return "Cancelada";
    } else if (st === -1) {
      return "Rejeitada";
    } else if (st === 1 && at) {
      return "Aguardando Entrega";
    } else if (st === 2 && at) {
      return "Concluída";
    } else if (st === 2 && !at) {
      return "Devolvida";
    }
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
    if (reserva.status === 1 && reserva.ativo) {
      s.push(
        <CardActions>
          <div>
            <Button size="small" color="secondary" onClick={() => this.inativaReserva(reserva.cod)}>
              Cancelar
              </Button>
          </div>
        </CardActions>
      );
    } else if (i) {
      s.push(
        <CardActions>
          <div>
            <Button variant="contained" size="small" color="secondary">
              Atrasada
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
            this.getUsername(res.usuario),
            res.obs,
            this.getStatusName(res.status, res.ativo),
            this.assembleActions(res)
          )
        );
      });
    }
    return r;
  }

  getItemDesc(itemCod) {
    let resp;
    this.state.itens.forEach(item => {
      if (itemCod === item.cod) {
        resp = item.cod + " - " + item.descricao
      }
    })
    return resp;
  }

  createData(item, inicio, fim, usuario, obs, status, acao) {
    return [item, inicio, fim, usuario, obs, status, acao];
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
          <UserHeader idUser={this.props.location.state.idUser} />
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
                      isAdmin: false
                    }
                  }}
                >
                  <Button startIcon={<AddAlarmIcon />} fullWidth variant="contained" color="primary">
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
              </MuiPickersUtilsProvider>
              <div className="itemFiltro">
                Status: <select ref="statusSelect">
                  <option key='-3' value='-3'>Todas</option>
                  <option key='1' value='1'>Aguardando Entrega</option>
                  <option key='2' value='2'>Concluídas</option>
                  <option key='-4' value='-4'>Devolvidas</option>
                  <option key='-1' value='-1'>Rejeitadas</option>
                </select>
              </div>
              <div className='itemFiltro' style={{ textAlign: "center" }}>
                <input type='checkbox' ref='cboxIndef' /> Buscar somente pelo Início
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
                    "Usuário",
                    "Observação",
                    "Status",
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

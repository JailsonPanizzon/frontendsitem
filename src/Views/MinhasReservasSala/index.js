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
    this.cancelarReserva = this.cancelarReserva.bind(this);
    let data = new Date();
    let data2 = new Date();
    data2.setDate(new Date().getDate() + 1);
    this.state = {
      salas: [],
      users: [],
      empresaCod: -1,
      isLoading: false,
      isAdmin: false,
      dateInit: data,
      dateEnd: data2,
      reservas: [],
      linhasTabela: [],
    };
  }

  getData() {
    let token = JSON.parse(localStorage.getItem("token"));
    this.setState({ isLoading: true });
    fetch(urlDB + "salas", {
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      }
    })
      .then(response => response.json())
      .then(sala => {
        fetch(urlDB + "usuarios", {
          headers: {
            "Content-Type": "application/json",
            authorization: token.acess_token,
            email: token.email
          }
        })
          .then(response => response.json())
          .then(usu => {
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
              this.setState({ salas: sala, users: usu, empresaCod: resposta[0].cod });
            }).catch(err => console.log(err));
          });
      });
  }

  componentDidMount() {
    this.getData();
    this.setState({ isAdmin: this.props.location.state.isAdmin });
  }

  cancelarReserva(codinho) {
    let token = JSON.parse(localStorage.getItem("token"));
    let result = window.confirm("Tem certeza que deseja cancelar esta reserva?");
    if (result) {
      fetch(urlDB + 'cancela/reservaSala', {
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
          alert("Reserva Cancelada com Sucesso!");
          window.location.reload(false);
        } else {
          alert("Deu ruim, aqui deixo a você um erro de presente: " + resposta.dbError);
          console.log(resposta.dbError);
        }
      }).catch(err => console.log(err));
    }

  }

  loadReservas() {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB + "reservasSalaEmpresaPeriodo", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      },
      body: JSON.stringify({
        empresa: this.state.empresaCod,
        datahorainicio: this.state.dateInit.toLocaleDateString() +
          " 00:00:00",
        datahorafim: this.state.dateEnd.toLocaleDateString() +
          " 23:59:59",
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

  getSalaNome(salaCod) {
    let resp;
    this.state.salas.forEach(sala => {
      if (salaCod === sala.cod) {
        resp = sala.nome;
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
    let hour = d.getHours().toString();
    hour = parseInt(hour, 10);
    if (hour < 10) {
      hour = '0' + hour;
    }
    let min = d.getMinutes().toString();
    min = parseInt(min, 10);
    if (min < 10) {
      min = '0' + min;
    }
    let r = dia + "/" + mes + "/" + d.getFullYear().toString() + "\n" + hour + ":" + min;
    return r;
  }

  rows() {
    let r = [];
    if (Array.isArray(this.state.reservas)) {
      this.state.reservas.forEach(res => {
        r.push(
          this.createData(
            this.getSalaNome(res.sala),
            this.getDataBonita(res.datahorainicio),
            this.getDataBonita(res.datahorafim),
            this.getUsername(res.usuario),
            res.obs,
            <CardActions>
              <div>
                <Button size="small" color="secondary" onClick={() => this.cancelarReserva(res.cod)}>
                  Cancelar Reserva
                    </Button>
              </div>
            </CardActions>
          )
        );
      });
    }
    return r;
  }

  createData(sala, inicio, fim, usuario, obs, acao) {
    return [sala, inicio, fim, usuario, obs, acao];
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
                    pathname: "/salas",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: false
                    }
                  }}
                >
                  <Button startIcon={<AddAlarmIcon />} fullWidth variant="contained" color="primary">
                    Reservar Sala
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
              <div className='itemFiltro' style={{ textAlign: "center" }}>
                <br />
                <Button variant="contained" color="secondary" onClick={this.loadReservas}>
                  Carregar
                    </Button>
                <br />
              </div>
            </div>
            <div className="itens">
              {this.state.salas.length < 1 ? (
                <div className="loading">
                  <CircularProgress disableShrink />{" "}
                </div>
              ) : (
                  SimpleTable(this.state.linhasTabela, [
                    "Sala",
                    "Início",
                    "Fim",
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

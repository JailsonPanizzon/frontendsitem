import React, { Component } from "react";
import { Link } from "react-router-dom";
import AdminHeader from "../../Headers/AdminHeader";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import "react-dropdown/style.css";
import { KeyboardDatePicker, KeyboardTimePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import CircularProgress from "@material-ui/core/CircularProgress";
import { SimpleTable } from "../widgets/table.js";
import Watch from "@material-ui/icons/AccessTime";
import urlDB from '../../dbURL';

class App extends Component {
  constructor(props) {
    super(props);
    this.getData = this.getData.bind(this);
    this.loadReservas = this.loadReservas.bind(this);
    this.getEmpresaNome = this.getEmpresaNome.bind(this);
    this.getUsername = this.getUsername.bind(this);
    this.inativaReserva = this.inativaReserva.bind(this);
    let data = new Date();
    let horaini = new Date();
    data.setDate(new Date().getDate() + 1);
    data.setHours(data.getHours() + 1);
    if (data.getMinutes() !== 0) {
      horaini.setMinutes((parseInt(data.getMinutes() / 15.1) + 1) * 15);
      data.setMinutes((parseInt(data.getMinutes() / 15.1) + 1) * 15);
    }
    this.state = {
      salas: [],
      users: [],
      empresas: [],
      isLoading: false,
      isAdmin: false,
      dateInit: horaini,
      dateEnd: data,
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
            fetch(urlDB + "empresas", {
              headers: {
                "Content-Type": "application/json",
                authorization: token.acess_token,
                email: token.email
              }
            })
              .then(response => response.json())
              .then(emp => {
                this.setState({ salas: sala, users: usu, empresas: emp })
              });
          });
      });
  }

  componentDidMount() {
    this.getData();
    this.setState({ isAdmin: this.props.location.state.isAdmin });
  }

  inativaReserva(codinho) {
    let token = JSON.parse(localStorage.getItem("token"));
    let res = window.prompt("Informe o Motivo da Rejeição:", "");
    if (res !== null && res !== "") {
      fetch(urlDB + 'inativa/reservasala', {
        method: 'put',
        headers: {
          "Content-Type": "application/json",
          authorization: token.acess_token,
          email: token.email
        },
        body: JSON.stringify({
          cod: codinho,
          comentario: res,
        })
      }).then(response => response.json()).then(resposta => {
        if (resposta === 1) {
          alert("Reserva Rejeitada com Sucesso!");
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
    if (this.refs.cboxDia.checked) {
      fetch(urlDB + "reservasSalaByDia", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          authorization: token.acess_token,
          email: token.email
        },
        body: JSON.stringify({
          sala: this.refs.salasSelect.value,
          datahorainicio: this.state.dateInit.toLocaleDateString(),
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
      fetch(urlDB + "reservasSalaByPeriodo", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          authorization: token.acess_token,
          email: token.email
        },
        body: JSON.stringify({
          sala: this.refs.salasSelect.value,
          datahorainicio: this.state.dateInit.toLocaleDateString() +
            " " +
            this.state.dateInit.getHours().toString() +
            ":" +
            this.state.dateInit.getMinutes().toString() +
            ":00",
          datahorafim: this.state.dateEnd.toLocaleDateString() +
            " " +
            this.state.dateEnd.getHours().toString() +
            ":" +
            this.state.dateEnd.getMinutes().toString() +
            ":00"
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
    let r = dia + "/" + mes + "/" + d.getFullYear().toString() + "\n" + d.getHours() + ":" + d.getMinutes().toString();
    return r;
  }

  rows() {
    let r = [];
    if (Array.isArray(this.state.reservas)) {
      this.state.reservas.forEach(res => {
        r.push(
          this.createData(
            this.getDataBonita(res.datahorainicio),
            this.getDataBonita(res.datahorafim),
            this.getEmpresaNome(res.empresa),
            this.getUsername(res.usuario),
            res.obs,
            <CardActions>
              <div>
                <Button size="small" color="secondary" onClick={() => this.inativaReserva(res.cod) }>
                  Rejeitar Reserva
                    </Button>
              </div>
            </CardActions>
          )
        );
      });
    }

    return r;
  }

  returnSalas() {
    let r = [];
    this.state.salas.forEach(sala => {
      r.push(
        <option key={sala.cod} value={sala.cod}>{sala.cod + " - " + sala.nome}</option>
      );
    });
    return r;
  }

  createData(inicio, fim, empresa, usuario, obs, acao) {
    return [inicio, fim, empresa, usuario, obs, acao];
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
  onChangeEndHora(end) {
    if (
      (this.state.dateEnd.getDate() === this.state.dateInit.getDate() &&
        end.getHours() < this.state.dateInit.getHours()) ||
      (end.getHours() === this.state.dateInit.getHours() &&
        end.getMinutes() > this.state.dateInit.getMinutes())
    ) {
      let date = new Date(end);
      date.setHours(end.getHours() - 1);
      this.setState({ dateInit: date, dateEnd: end });
    } else {
      this.setState({ dateEnd: end });
    }
  }
  onChangeInitHora(init) {
    if (
      (this.state.dateEnd.getDate() === this.state.dateInit.getDate() &&
        init.getHours() > this.state.dateEnd.getHours()) ||
      (init.getHours() === this.state.dateEnd.getHours() &&
        init.getMinutes() > this.state.dateEnd.getMinutes())
    ) {
      let date = new Date(init);
      date.setHours(init.getHours() + 1);
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
                    pathname: "/salas",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: true
                    }
                  }}
                >
                  <Button fullWidth variant="contained" color="primary">
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
              <div className="itemFiltro">
                Sala: <select ref="salasSelect">
                  {this.returnSalas()}
                </select>
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
                  <KeyboardTimePicker
                    margin="normal"
                    id="time-picker"
                    minutesStep={15}
                    label="Hora Inicial"
                    value={this.state.dateInit}
                    keyboardIcon={<Watch />}
                    onChange={this.onChangeInitHora.bind(this)}
                    KeyboardButtonProps={{
                      "aria-label": "change time"
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
                <div className="itemFiltro">
                  <KeyboardTimePicker
                    margin="normal"
                    icon
                    minutesStep={15}
                    disablePast
                    id="date-picker-dialog"
                    label="Hora Final"
                    value={this.state.dateEnd}
                    keyboardIcon={<Watch />}
                    onChange={this.onChangeEndHora.bind(this)}
                    KeyboardButtonProps={{
                      "aria-label": "change time",
                      setInterval: 25
                    }}
                  />
                </div>
              </MuiPickersUtilsProvider>
              <div className='itemFiltro' style={{ textAlign: "center" }}>
                <input type='checkbox' ref='cboxDia' /> Pesquisa por dia
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
              {this.state.salas.length < 1 ? (
                <div className="loading">
                  <CircularProgress disableShrink />{" "}
                </div>
              ) : (
                  SimpleTable(this.state.linhasTabela, [
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

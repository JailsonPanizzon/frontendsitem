import React, { Component } from "react";
import { Link } from "react-router-dom";
import AdminHeader from "../../Headers/AdminHeader";
import UserHeader from "../../Headers/UserHeader";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import "react-dropdown/style.css";
import { KeyboardDatePicker, KeyboardTimePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import CircularProgress from "@material-ui/core/CircularProgress";
import { SimpleTable } from "../widgets/table.js";
import Watch from "@material-ui/icons/AccessTime";
import { consultarSalasAgendas } from "../../Functions/gets.js";
import urlDB from "../../dbURL";
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Edit from "@material-ui/icons/Edit";
import AddAlarmIcon from '@material-ui/icons/AddAlarm';
import DesktopMacIcon from '@material-ui/icons/DesktopMac';

class App extends Component {
  constructor(props) {
    super(props);
    this.getData = this.getData.bind(this);
    this.salaAgendada = this.salaAgendada.bind(this);
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
      isLoading: false,
      isAdmin: false,
      redirect: false,
      redIdSala: 0,
      dateInit: horaini,
      dateEnd: data,
      salasAgendadas: []
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
        this.setState({ salas: sala });
      });
    consultarSalasAgendas().then(res => {
      this.setState({ salasAgendadas: res, isLoading: false });
    });
  }

  reservarSala(codSala) {
    this.setState({
      redIdSala: codSala,
      redInicioDate:
        this.refs.inicioDField.value +
        " " +
        this.refs.inicioHField.value +
        ":00",
      redFimDate:
        this.refs.fimDField.value + " " + this.refs.fimHField.value + ":00",
      redirect: "/reservaSala"
    });
  }

  componentDidMount() {
    this.getData();
    this.setState({ isAdmin: this.props.location.state.isAdmin });
  }
  salaAgendada(sala) {
    let retorno = true;
    if (!sala.disponivel) {
      return false;
    }
    this.state.salasAgendadas.forEach(agenda => {
      if (agenda.sala === sala.cod) {
        if (
          (this.state.dateInit >= new Date(agenda.dataInicio) &&
            this.state.dateInit <= new Date(agenda.dataFim)) ||
          (this.state.dateEnd >= new Date(agenda.dataInicio) &&
            this.state.dateEnd <= new Date(agenda.dataFim)) ||
          (this.state.dateInit <= new Date(agenda.dataInicio) &&
            this.state.dateEnd >= new Date(agenda.dataFim))
        ) {
          retorno = false;
          return;
        }
      }
    });

    return retorno;
  }
  rows() {
    let r = [];
    if (Array.isArray(this.state.salas)) {
      this.state.salas.forEach(sala => {
        r.push(
          this.createData(
            sala.cod,
            sala.nome,
            sala.descricao,
            <CardActions>
              {this.state.isAdmin && (
                <div>
                  <Link
                    to={{
                      pathname: "/novo/sala",
                      state: {
                        idSala: sala.cod,
                        idUser: this.props.location.state.idUser
                      }
                    }}
                  >
                    <Button startIcon={<Edit />} size="small" color="secondary">
                      Editar
                    </Button>
                  </Link>
                  <Link
                    to={{
                      pathname: "/itensBySala",
                      state: {
                        idSala: sala.cod,
                        idUser: this.props.location.state.idUser,
                        isAdmin: true,
                        salaNome: sala.nome
                      }
                    }}
                  >
                    <Button startIcon={<DesktopMacIcon />} style={{marginLeft: 5}} size="small" color="secondary">
                      Itens
                    </Button>
                  </Link>
                </div>
              )}
              {this.salaAgendada(sala) && (
                <Link
                  to={{
                    pathname: "reservaSala",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: this.state.isAdmin,
                      idSala: sala.cod,
                      dataInicio:
                        this.state.dateInit.getFullYear().toString() +
                        "-" +
                        (this.state.dateInit.getMonth() + 1 < 10
                          ? "0" + this.state.dateInit.getMonth().toString()
                          : (this.state.dateInit.getMonth() + 1).toString()) +
                        "-" +
                        (this.state.dateInit.getDate() < 10
                          ? "0" + this.state.dateInit.getDate().toString()
                          : this.state.dateInit.getDate().toString()) +
                        " " +
                        this.state.dateInit.getHours().toString() +
                        ":" +
                        this.state.dateInit.getMinutes().toString() +
                        ":00",
                      dataFim:
                        this.state.dateEnd.getFullYear().toString() +
                        "-" +
                        (this.state.dateEnd.getMonth() + 1 < 10
                          ? "0" + this.state.dateEnd.getMonth().toString()
                          : (this.state.dateInit.getMonth() + 1).toString()) +
                        "-" +
                        (this.state.dateEnd.getDate() < 10
                          ? "0" + this.state.dateEnd.getDate().toString()
                          : this.state.dateEnd.getDate().toString()) +
                        " " +
                        this.state.dateEnd.getHours().toString() +
                        ":" +
                        this.state.dateEnd.getMinutes().toString() +
                        ":00"
                    }
                  }}
                >
                  <Button startIcon={<AddAlarmIcon />} size="small" variant='contained' color="primary">
                    Reservar
                  </Button>
                </Link>
              )}
            </CardActions>
          )
        );
      });
    }

    return r;
  }

  createData(codigo, nome, descricao, acao) {
    return [nome, codigo, descricao, acao];
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

        <div className="Container">
          <div className="Lista">
            <div className="filtros">
              {this.state.isAdmin && (
                <div className="itemFiltro" style={{ textAlign: "center" }}>
                  <Link
                    to={{
                      pathname: "/novo/sala",
                      state: {
                        idUser: this.props.location.state.idUser
                      }
                    }}
                  >
                    <br />
                    <Button startIcon={<AddCircleIcon />}  fullWidth variant="contained" color="primary">
                      Nova sala
                    </Button>
                  </Link>
                  <br />
                </div>
              )}
              <div
                className="itemFiltro"
                style={{
                  textAlign: "center",
                  fontFamily: "Roboto,Helvetica,Arial,sans-serif"
                }}
              >
                Opções de Reserva
              </div>

              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <div className="itemFiltro">
                  <KeyboardDatePicker
                    margin="normal"
                    disablePast
                    id="date-picker-dialog"
                    minDate={Date()}
                    label="Data de Reserva"
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
                    label="Hora de Reserva"
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
                    minDate={Date()}
                    label="Data de devolução"
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
                    label="Hora de devolução"
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
            </div>
            <div className="itens">
              {this.state.salas.length < 1 ? (
                <div className="loading">
                  <CircularProgress disableShrink />{" "}
                </div>
              ) : (
                SimpleTable(this.rows(), [
                  "Sala",
                  "Código",
                  "Descrição",
                  "Opções"
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

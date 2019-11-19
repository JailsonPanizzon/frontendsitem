import React, { Component } from "react";
import { Link } from "react-router-dom";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import "react-dropdown/style.css";
import CircularProgress from "@material-ui/core/CircularProgress";
import UserHeader from "../../Headers/UserHeader";
import { SimpleTable } from "../widgets/table.js";
import urlDB from '../../dbURL'
import DesktopMacIcon from '@material-ui/icons/DesktopMac';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import DeleteIcon from '@material-ui/icons/Delete';
import RefreshIcon from '@material-ui/icons/Refresh';
import ScheduleIcon from '@material-ui/icons/Schedule';
import AlarmOnIcon from '@material-ui/icons/AlarmOn';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgs: ["../images/ok.png", "../images/notok.png", "../images/semiok.png", "../images/badsemiok.png"],
      itens: [],
      salas: [],
      notificacoes: undefined,
      atrasadas: [],
      reservas: [],
      reservasSala: [],
      linhasTabela: [],
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
        fetch(urlDB + "salas", {
          headers: {
            "Content-Type": "application/json",
            authorization: token.acess_token,
            email: token.email
          }
        })
          .then(response => response.json())
          .then(sala => {
            fetch(urlDB + "reservasSalaInativas", {
              headers: {
                "Content-Type": "application/json",
                authorization: token.acess_token,
                email: token.email
              }
            })
              .then(response => response.json())
              .then(atas => {
                fetch(urlDB + 'reservasUsuarioEmpresa', {
                  method: 'post',
                  headers: {
                    "Content-Type": "application/json",
                    authorization: token.acess_token,
                    email: token.email
                  },
                  body: JSON.stringify({
                    user: this.props.location.state.idUser,
                  })
                }).then(response => response.json()).then(ata => {
                  fetch(urlDB + 'notificacoes', {
                    method: 'post',
                    headers: {
                      "Content-Type": "application/json",
                      authorization: token.acess_token,
                      email: token.email
                    },
                    body: JSON.stringify({
                      user: this.props.location.state.idUser,
                    })
                  }).then(response => response.json()).then(notif => {
                    fetch(urlDB + 'reservasAtrasadasUser', {
                      method: 'post',
                      headers: {
                        "Content-Type": "application/json",
                        authorization: token.acess_token,
                        email: token.email
                      },
                      body: JSON.stringify({
                        user: this.props.location.state.idUser,
                      })
                    }).then(response => response.json()).then(at => {
                      if (Array.isArray(notif)) {
                        this.setState({ itens: item, salas: sala, atrasadas: at, reservas: ata, reservasSala: atas, notificacoes: notif }, () => {
                          //pegando atrasadas e criando suas devidas notificacoes
                          if (Array.isArray(this.state.atrasadas)) {
                            let s;
                            let arr = this.state.notificacoes;
                            this.state.atrasadas.forEach(rev => {
                              s = {
                                cod: -1,
                                empresa: rev.empresa,
                                evento: "ATRASADARESERVA",
                                dados: rev.cod.toString(),
                                comentario: "Reserva atrasada",
                                datanotif: new Date().toString(),
                              };
                              arr.push(s);
                            })
                            this.setState({ notificacoes: arr }, () => {
                              this.setState({ linhasTabela: this.rows() })
                            })
                          } else {
                            this.setState({ linhasTabela: this.rows() })
                          }
                        });
                      } else {
                        this.setState({ itens: item, salas: sala, atrasadas: at, reservas: ata, reservasSala: atas, notificacoes: 0 }, () => {
                          this.setState({ linhasTabela: this.rows() })
                        });
                      }
                    }).catch(err => console.log(err));
                  });
                });
              });
          });
      });
  }

  componentDidMount() {
    this.getData();
  }

  removeNotificacao(notif) {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB + 'apaga/notificacao', {
      method: 'delete',
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      },
      body: JSON.stringify({
        cod: notif.cod,
      })
    }).then(response => response.json()).then(resposta => {
      if (resposta.delete === true) {
        let i = 0, array = this.state.notificacoes;
        for (i = 0; i < array.length; i++) {
          if (array[i].cod === notif.cod) {
            array.splice(i, 1);
          }
        }
        this.setState({ notificacoes: array }, () => {
          this.setState({ linhasTabela: this.rows() })
        });
      } else {
        alert("Deu ruim, aqui deixo a você um erro de presente: " + resposta.dbError);
        console.log(resposta.dbError);
      }
    }).catch(err => console.log(err));
  }

  createData(img, datas, info, coment, acao) {
    return [img, datas, info, coment, acao];
  }

  getNotificacaoProcessada(notif) {
    let r1, r2 = [], r3 = [];
    if (notif.evento === "REJEITARESERVA") {
      let item, res;
      this.state.reservas.forEach(r => {
        if (r.cod.toString() === notif.dados) {
          res = r;
        }
      })
      this.state.itens.forEach(i => {
        if (i.cod === res.item) {
          item = i.cod;
        }
      })
      r1 = ("Sua reserva do Item: " + this.getItemDesc(item) + " foi Rejeitada");
      r2.push(notif.comentario);
      r3.push(
        <CardActions>
          <div>
            <Button startIcon={<DeleteIcon/>} size="small" color="secondary" onClick={() => this.removeNotificacao(notif)}>
              Apagar
              </Button>
          </div>
        </CardActions>
      );
    } else if (notif.evento === "REJEITARESERVASALA") {
      let sala, res;
      this.state.reservasSala.forEach(r => {
        if (r.cod.toString() === notif.dados) {
          res = r;
        }
      })
      this.state.salas.forEach(i => {
        if (i.cod === res.sala) {
          sala = i.cod;
        }
      })
      r1 = ("Sua reserva da Sala: " + this.getSalaName(sala) + " foi Rejeitada");
      r2.push(notif.comentario);
      r3.push(
        <CardActions>
          <div>
            <Button startIcon={<DeleteIcon/>} size="small" color="secondary" onClick={() => this.removeNotificacao(notif)}>
              Apagar
              </Button>
          </div>
        </CardActions>
      );
    } else if (notif.evento === "DEVOLVIDARESERVA") {
      let item, res;
      this.state.reservas.forEach(r => {
        if (r.cod.toString() === notif.dados) {
          res = r;
        }
      })
      this.state.itens.forEach(i => {
        if (i.cod === res.item) {
          item = i.cod;
        }
      })
      r1 = ("Reserva do Item: " + this.getItemDesc(item));
      r2.push(notif.comentario);
      r3.push(
        <CardActions>
          <div>
            <Button startIcon={<DeleteIcon/>} size="small" color="secondary" onClick={() => this.removeNotificacao(notif)}>
              Apagar
              </Button>
          </div>
        </CardActions>
      );
    } else if (notif.evento === "CONCLUIRESERVA") {
      let item, res;
      this.state.reservas.forEach(r => {
        if (r.cod.toString() === notif.dados) {
          res = r;
        }
      })
      this.state.itens.forEach(i => {
        if (i.cod === res.item) {
          item = i.cod;
        }
      })
      r1 = ("Sua reserva do Item: " + this.getItemDesc(item) + " foi Concluída");
      r2.push("Novo Status: " + notif.comentario);
      r3.push(
        <CardActions>
          <div>
            <Button startIcon={<DeleteIcon/>} size="small" color="secondary" onClick={() => this.removeNotificacao(notif)}>
              Apagar
              </Button>
            <Link
              to={{
                pathname: "/meusItens",
                state: {
                  idUser: this.props.location.state.idUser,
                  isAdmin: false,
                }
              }}
            ><Button style={{marginLeft:5}} size="small" variant='contained' color="primary">
                Minhas reservas de itens
              </Button></Link>
          </div>
        </CardActions>
      );
    } else if (notif.evento === "ATRASADARESERVA") {
      r1 = ("Reserva em Atraso");
      let item, res;
      this.state.reservas.forEach(r => {
        if (r.cod.toString() === notif.dados) {
          res = r;
        }
      })
      this.state.itens.forEach(i => {
        if (i.cod === res.item) {
          item = i.cod;
        }
      })
      r2.push("Item: ");
      r2.push(this.getItemDesc(item));
      r2.push("\nData de Fim: " + this.getDataBonita(res.datafim));
      r3.push(
        <CardActions>
          <div>
            <Link
              to={{
                pathname: "/reservas",
                state: {
                  idUser: this.props.location.state.idUser,
                  isAdmin: false,
                }
              }}
            ><Button size="small" variant='contained' color="primary">
                Ver Reservas
              </Button></Link>
          </div>
        </CardActions>
      );
    }
    return { r1, r2, r3 };
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

  getItemDesc(itemCod) {
    let resp;
    this.state.itens.forEach(item => {
      if (itemCod === item.cod) {
        resp = item.cod + " - " + item.descricao;
      }
    })
    return resp;
  }

  getSalaName(sCod) {
    let resp = [];
    this.state.salas.forEach(sala => {
      if (sCod === sala.cod) {
        resp.push(
          sala.nome
        );
      }
    })
    return resp;
  }


  getImage(notif) {
    if (notif.evento === "REJEITARESERVA") {
      return this.state.imgs[1];
    } else if (notif.evento === "CONFIRMARESERVA") {
      return this.state.imgs[0];
    } else if (notif.evento === "REJEITARESERVASALA") {
      return this.state.imgs[1];
    } else if (notif.evento === "CONCLUIRESERVA") {
      return this.state.imgs[0];
    } else if (notif.evento === "DEVOLVIDARESERVA") {
      return this.state.imgs[2];
    } else if (notif.evento === "ATRASADARESERVA") {
      return this.state.imgs[3];
    }
  }

  rows() {
    let r = [];
    console.log(this.state.notificacoes);
    if (Array.isArray(this.state.notificacoes)) {
      this.state.notificacoes.forEach(n => {
        let { r1, r2, r3 } = this.getNotificacaoProcessada(n);
        r.push(
          this.createData(
            <img src={this.getImage(n)} height='40' alt='imgNotif'></img>, this.getDataBonita(n.datanotif), r1, r2, r3,
          )
        );
      });
    }

    return r;
  }

  render() {
    return (
      <div>
        <div>
          <UserHeader idUser={this.props.location.state.idUser} />
        </div>
        <div className="Container">
          <div className="Lista">
            <div className="painelLateral">

              <div style={{ textAlign: "center" }}>
                <br />
                <Button startIcon={<ScheduleIcon/>} fullWidth variant="contained" size='large' color="primary">
                  Reservar
                    </Button>
                <br />
              </div>
              <div style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/itens",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: false
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<DesktopMacIcon/>} fullWidth variant="text" size='small' color="primary">
                    Itens
                    </Button>
                </Link>
                <br />
              </div>
              <div style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/salas",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: false
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<MeetingRoomIcon/>} fullWidth variant="text" size='small' color="primary">
                    Salas
                    </Button>
                </Link>
                <br />
              </div>
              <br />
              <div style={{ textAlign: "center" }}>
                <Button startIcon={<AlarmOnIcon/>} fullWidth variant="contained" size='large' color="secondary">
                  Minhas Reservas
                    </Button>
                <br />
              </div>
              <div style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/meusItens",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: false
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<DesktopMacIcon/>} fullWidth variant="text" size='small' color="secondary">
                    Itens
                    </Button>
                </Link>
                <br />
              </div>
              <div style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/minhasSalas",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: false
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<MeetingRoomIcon/>} fullWidth variant="text" size='small' color="secondary">
                    Salas
                    </Button>
                </Link>
                <br />
              </div>
              <div style={{ textAlign: "center" }}>
                <br />
                <Button startIcon={<RefreshIcon/>} fullWidth variant="contained" onClick={() => window.location.reload(false)} size='large' color="default">
                  Atualizar
                    </Button>
                <br />
              </div>
            </div>
            <div className="itens">
              {this.state.notificacoes === undefined ? (
                <div className="loading">
                  <CircularProgress disableShrink />{" "}
                </div>
              ) : (
                  SimpleTable(this.state.linhasTabela, [
                    "",
                    "Data",
                    "Informação",
                    "Comentário",
                    "Ações",
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

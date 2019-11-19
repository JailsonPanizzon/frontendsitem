import React, { Component } from "react";
import { Link } from "react-router-dom";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import "react-dropdown/style.css";
import CircularProgress from "@material-ui/core/CircularProgress";
import AdminHeader from "../../Headers/AdminHeader";
import { SimpleTable } from "../widgets/table.js";
import urlDB from '../../dbURL'
import DesktopMacIcon from '@material-ui/icons/DesktopMac';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import GroupIcon from '@material-ui/icons/Group';
import DeleteIcon from '@material-ui/icons/Delete';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import BusinessIcon from '@material-ui/icons/Business';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import AddAlarmIcon from '@material-ui/icons/AddAlarm';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import ScheduleIcon from '@material-ui/icons/Schedule';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgs: ["../images/ok.png", "../images/notok.png", "../images/semiok.png", "../images/badsemiok.png", "../images/addblue.png"],
      itens: [],
      salas: [],
      usuariosPend: [],
      notificacoes: undefined,
      atrasadas: [],
      empresas: [],
      reservas: [],
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
        fetch(urlDB + "empresas", {
          headers: {
            "Content-Type": "application/json",
            authorization: token.acess_token,
            email: token.email
          }
        })
          .then(response => response.json())
          .then(emp => {
            fetch(urlDB + "salas", {
              headers: {
                "Content-Type": "application/json",
                authorization: token.acess_token,
                email: token.email
              }
            })
              .then(response => response.json())
              .then(sala => {
                fetch(urlDB + "reservasAtrasadas", {
                  headers: {
                    "Content-Type": "application/json",
                    authorization: token.acess_token,
                    email: token.email
                  }
                })
                  .then(response => response.json())
                  .then(at => {
                    fetch(urlDB + "usuariosPend", {
                      headers: {
                        "Content-Type": "application/json",
                        authorization: token.acess_token,
                        email: token.email
                      }
                    })
                      .then(response => response.json())
                      .then(up => {
                        fetch(urlDB + "reservasAtivas", {
                          headers: {
                            "Content-Type": "application/json",
                            authorization: token.acess_token,
                            email: token.email
                          }
                        })
                          .then(response => response.json())
                          .then(ata => {
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
                              if (Array.isArray(notif)) {
                                this.setState({ itens: item, empresas: emp, usuariosPend: up, salas: sala, atrasadas: at, reservas: ata, notificacoes: notif }, () => {
                                  //pegando atrasadas e criando suas devidas notificacoes
                                  if (Array.isArray(this.state.atrasadas)) {
                                    let s;
                                    let arr = this.state.notificacoes;
                                    this.state.atrasadas.forEach(rev => {
                                      s = {
                                        cod: -1,
                                        empresa: 0,
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
                                this.setState({ itens: item, empresas: emp, usuariosPend: up, salas: sala, atrasadas: at, reservas: ata, notificacoes: 0 }, () => {
                                  this.setState({ linhasTabela: this.rows() })
                                });
                              }
                            }).catch(err => console.log(err));
                          });
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

  efetivaUsuario(userPend, yesNo, notif) {
    let token = JSON.parse(localStorage.getItem("token"));
    if (yesNo) {
      fetch(urlDB + "novo/usuario", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          authorization: token.acess_token,
          email: token.email
        },
        body: JSON.stringify({
          nome: userPend.nome,
          email: userPend.email,
          senha: userPend.senha,
          telefone: userPend.telefone,
          isadmin: false,
          logradouro: userPend.logradouro,
          numeroend: userPend.numeroend,
          bairro: userPend.bairro,
          cidade: userPend.cidade,
          uf: userPend.uf,
          empresa: userPend.empresa,
        })
      })
        .then(response => response.json())
        .then(user => {
          if (Array.isArray(user)) {
            fetch(urlDB + 'apaga/userPend', {
              method: 'delete',
              headers: {
                "Content-Type": "application/json",
                authorization: token.acess_token,
                email: token.email
              },
              body: JSON.stringify({
                cod: userPend.cod,
              })
            }).then(response => response.json()).then(resposta => {
              if (resposta.delete === true) {
                this.removeNotificacao(notif);
                alert("Usuario Criado!");
              } else {
                alert("Deu ruim, aqui deixo a você um erro de presente: " + resposta.dbError);
                console.log(resposta.dbError);
              }
            }).catch(err => console.log(err));
          } else {
            alert("Um erro ocorreu, esta é a mensagem dele para você: " + user.dbError);
          }
        })
        .catch(err => console.log(err));
    } else {
      fetch(urlDB + 'apaga/userPend', {
        method: 'delete',
        headers: {
          "Content-Type": "application/json",
          authorization: token.acess_token,
          email: token.email
        },
        body: JSON.stringify({
          cod: userPend.cod,
        })
      }).then(response => response.json()).then(resposta => {
        if (resposta.delete === true) {
          this.removeNotificacao(notif);
        } else {
          alert("Deu ruim, aqui deixo a você um erro de presente: " + resposta.dbError);
          console.log(resposta.dbError);
        }
      }).catch(err => console.log(err));
    }
  }

  createData(img, datas, info, coment, emp, acao) {
    return [img, datas, info, coment, emp, acao];
  }

  getNotificacaoProcessada(notif) {
    let r1, r2 = [], r3 = [];
    if (notif.evento === "NOVARESERVA") {
      r1 = ("Nova Reserva");
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
      r2.push("\nData de Início: " + this.getDataBonita(res.datainicio));
      r3.push(
        <CardActions>
          <div>
            <Link
              to={{
                pathname: "/reservasPendentes",
                state: {
                  idUser: this.props.location.state.idUser,
                  isAdmin: true,
                }
              }}
            ><Button size="small" variant='contained' color="primary">
                Ver Reservas Pendentes
              </Button></Link>
            <Button startIcon={<DeleteIcon />} style={{ marginLeft: 5 }} size="small" color="secondary" onClick={() => this.removeNotificacao(notif)}>
              Apagar
              </Button>
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
                  isAdmin: true,
                }
              }}
            ><Button size="small" variant='contained' color="primary">
                Ver Reservas
              </Button></Link>
          </div>
        </CardActions>
      );
    } else if (notif.evento === "NEWUSERPEND") {
      r1 = ("Novo Usuário Cadastrado");
      let user;
      this.state.usuariosPend.forEach(r => {
        if (r.cod.toString() === notif.dados) {
          user = r;
        }
      })
      r2.push("Nome: " + user.nome + " | Telefone: " + user.telefone + " | Cidade: " + user.cidade + "/" + user.uf);
      r3.push(
        <CardActions>
          <div>
            <Button startIcon={<ThumbUpIcon />} size="small" variant='contained' color="primary" onClick={() => this.efetivaUsuario(user, true, notif)}>
              Aceitar
              </Button>
            <Button startIcon={<ThumbDownIcon />} style={{ marginLeft: 5 }} size="small" color="secondary" onClick={() => this.efetivaUsuario(user, false, notif)}>
              Rejeitar
              </Button>
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

  getEmpresaNotif(notif) {
    let r;
    if (notif.evento === 'NOVARESERVA') {
      this.state.reservas.forEach(e => {
        if (e.cod.toString() === notif.dados) {
          r = e.empresa;
        }
      })
    } else if (notif.evento === 'ATRASADARESERVA') {
      this.state.reservas.forEach(e => {
        if (e.cod.toString() === notif.dados) {
          r = e.empresa;
        }
      })
    } else if (notif.evento === 'NEWUSERPEND') {
      this.state.usuariosPend.forEach(e => {
        if (e.cod.toString() === notif.dados) {
          r = e.empresa;
        }
      })
    }
    return r;
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

  getImage(notif) {
    if (notif.evento === "NOVARESERVA") {
      return this.state.imgs[2];
    } else if (notif.evento === "ATRASADARESERVA") {
      return this.state.imgs[3];
    } else if (notif.evento === "NEWUSERPEND") {
      return this.state.imgs[4];
    }
  }

  rows() {
    let r = [];
    if (Array.isArray(this.state.notificacoes)) {
      this.state.notificacoes.forEach(n => {
        let { r1, r2, r3 } = this.getNotificacaoProcessada(n);
        r.push(
          this.createData(
            <img src={this.getImage(n)} height='40' alt='imgNotif'></img>, this.getDataBonita(n.datanotif), r1, r2, this.getEmpresaNome(this.getEmpresaNotif(n)), r3,
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
          <AdminHeader idUser={this.props.location.state.idUser} />
        </div>
        <div className="Container">
          <div className="Lista">
            <div className="painelLateral">
              <div style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/itens",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: true
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<DesktopMacIcon />} fullWidth variant="contained" size='large' color="primary">
                    Itens
                    </Button>
                </Link>
                <br />
              </div>
              <div style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/itens",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: true
                    }
                  }}
                >
                  <br />
                  <Button p={-2} startIcon={<AddAlarmIcon />} fullWidth variant="text" size='small' color="primary">
                    Reservar
                    </Button>
                </Link>
                <br />
              </div>
              <div style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/novo/item",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: true
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<AddCircleIcon />} fullWidth variant="text" size='small' color="primary">
                    Novo Item
                    </Button>
                </Link>
                <br />
              </div>
              <div style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/novo/categoria",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: true
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<AddCircleIcon />} fullWidth variant="text" size='small' color="primary">
                    Nova Categoria
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
                      isAdmin: true
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<MeetingRoomIcon />} fullWidth variant="contained" size='large' color="secondary">
                    Salas
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
                      isAdmin: true
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<AddAlarmIcon />} fullWidth variant="text" size='small' color="secondary">
                    Reservar
                    </Button>
                </Link>
                <br />
              </div>
              <div style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/novo/sala",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: true
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<AddCircleIcon />} fullWidth variant="text" size='small' color="secondary">
                    Nova Sala
                    </Button>
                </Link>
                <br />
              </div>

              <div style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/reservasPendentes",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: true
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<ScheduleIcon />} fullWidth variant="contained" size='large' color="primary">
                    Reservas
                    </Button>
                </Link>
                <br />
              </div>
              <div style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/reservas",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: true
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<DesktopMacIcon />} fullWidth variant="text" size='small' color="primary">
                    Itens
                    </Button>
                </Link>
                <br />
              </div>
              <div style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/reservasSala",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: true
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<MeetingRoomIcon />} fullWidth variant="text" size='small' color="primary">
                    Salas
                    </Button>
                </Link>
                <br />
              </div>
              <div style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/reservasPendentes",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: true
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<AddAlarmIcon />} fullWidth variant="text" size='small' color="primary">
                    Pendentes
                    </Button>
                </Link>
                <br />
              </div>

              <div style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/usuarios",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: true
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<GroupIcon />} fullWidth variant="contained" size='large' color="secondary">
                    Usuários
                    </Button>
                </Link>
                <br />
              </div>
              <div style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/novo/usuario",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: true
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<AccountCircleIcon />} fullWidth variant="text" size='small' color="secondary">
                    Novo Usuário
                    </Button>
                </Link>
                <br />
              </div>
              <div style={{ textAlign: "center" }}>
                <Link
                  to={{
                    pathname: "/novo/empresa",
                    state: {
                      idUser: this.props.location.state.idUser,
                      isAdmin: true
                    }
                  }}
                >
                  <br />
                  <Button startIcon={<BusinessIcon />} fullWidth variant="text" size='small' color="secondary">
                    Nova Empresa
                    </Button>
                </Link>
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
                    "Empresa",
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

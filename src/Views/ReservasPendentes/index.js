import React, { Component } from "react";
import { Link } from "react-router-dom";
import AdminHeader from "../../Headers/AdminHeader";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import "react-dropdown/style.css";
import CircularProgress from "@material-ui/core/CircularProgress";
import { SimpleTable } from "../widgets/table.js";
import urlDB from '../../dbURL';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';

let salas = [];

class App extends Component {
  constructor(props) {
    super(props);
    this.getData = this.getData.bind(this);
    this.loadReservas = this.loadReservas.bind(this);
    this.mudaStatusReservaPos = this.mudaStatusReservaPos.bind(this);
    this.mudaStatusReservaNeg = this.mudaStatusReservaNeg.bind(this);
    this.state = {
      itens: [],
      users: [],
      salas: [],
      localizacoes: [],
      empresas: [],
      isLoading: false,
      isAdmin: false,
      reservas: [],
      linhasTabela: [],
      open: false,
      setOpen: false,
      newLoc: 0,
      trabalhandoComAReserva: -1,
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
                fetch(urlDB + "salas", {
                  headers: {
                    "Content-Type": "application/json",
                    authorization: token.acess_token,
                    email: token.email
                  }
                })
                  .then(response => response.json())
                  .then(sala => {
                    fetch(urlDB + "localizacoes", {
                      headers: {
                        "Content-Type": "application/json",
                        authorization: token.acess_token,
                        email: token.email
                      }
                    })
                      .then(response => response.json())
                      .then(loc => {
                        this.setState({ itens: item, users: usu, empresas: emp, salas: sala, localizacoes: loc }, () =>{
                          salas = sala;
                        })
                      });
                  });
              });
          });
      });
  }

  componentDidMount() {
    this.getData();
    this.setState({ isAdmin: this.props.location.state.isAdmin });
  }

  handleClose(value) {
    this.setState({ open: false, newLoc: value }, () => {
      this.mudaStatusReservaPos(this.state.trabalhandoComAReserva, 3, value);
    });
  }

  mudaStatusReservaPos(reserva, st, loc) {
    let token = JSON.parse(localStorage.getItem("token"));
    if(st === 3){
      fetch(urlDB + 'mudaStatusReserva', {
        method: 'put',
        headers: {
          "Content-Type": "application/json",
          authorization: token.acess_token,
          email: token.email
        },
        body: JSON.stringify({
          cod: reserva.cod,
          status: 2,
        })
      }).then(response => response.json()).then(resposta => {
        if (resposta === 1) {
          let i = 0, array = this.state.reservas;
          for (i = 0; i < array.length; i++) {
            if (array[i].cod === reserva.cod) {
              array.splice(i, 1);
            }
          }
          fetch(urlDB+"novo/localizacao", {
            method: "post",
            headers: {
              "Content-Type": "application/json",
              authorization: token.acess_token,
              email: token.email
            },
            body: JSON.stringify({
              item: reserva.item,
              sala: loc,
            })
          })
            .then(response => response.json())
            .then(resp => {
              if (Array.isArray(resp) || resp === 1) {
                this.setState({ reservas: array, trabalhandoComAReserva: -1 }, () => {
                  this.setState({ linhasTabela: this.rows() })
                });
              } else {
                alert("Um erro ocorreu, aí vai ele: " + resp.dbError);
              }
            })
            .catch(err => console.log(err));
        } else {
          alert("Deu ruim, aqui deixo a você um erro de presente: " + resposta.dbError);
          console.log(resposta.dbError);
        }
      }).catch(err => console.log(err));
    }
    else if (st === 2) {
      this.setState({ open: true, trabalhandoComAReserva: reserva });
    } 
  }

  mudaStatusReservaNeg(codinho, st) {
    let token = JSON.parse(localStorage.getItem("token"));
    let res = window.prompt("Informe o Motivo da Rejeição:", "");
    if (res !== null && res !== "") {
      fetch(urlDB + 'mudaStatusReserva', {
        method: 'put',
        headers: {
          "Content-Type": "application/json",
          authorization: token.acess_token,
          email: token.email
        },
        body: JSON.stringify({
          cod: codinho,
          status: st,
          comentario: res,
        })
      }).then(response => response.json()).then(resposta => {
        if (resposta === 1) {
          alert("Reserva Rejeitada com Sucesso!");
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
    fetch(urlDB + "reservasByEmpresaStatus", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      },
      body: JSON.stringify({
        emp: this.refs.empresasSelect.value,
        status: this.refs.statusSelect.value
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

  getStatusName(st) {
    if (st === -1) {
      return "Rejeitada";
    } else if (st === 1) {
      return "Aguardando Entrega";
    }
  }

  getLocalizacao(itemCod) {
    if(Array.isArray(this.state.localizacoes)){
      let salaID = -1, resp = [];
      this.state.localizacoes.forEach(loc => {
        if (itemCod === loc.item) {
          salaID = loc.sala;
        }
      })
      if (salaID === -1) {
        return 'S/L'
      }
      this.state.salas.forEach(sala => {
        if (salaID === sala.cod) {
          resp.push(
            <Link
              to={{
                pathname: "/novo/sala",
                state: {
                  idSala: sala.cod,
                  idUser: this.props.location.state.idUser
                }
              }}
            >{sala.nome}</Link>
          );
        }
      })
      return resp;
    }else{
      return "S/L";
    }
    
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
    let s = [];
    if (reserva.status === -1) {
      s.push(<CardActions>
        <div>
          <Link
            to={{
              pathname: "/novo/item",
              state: {
                idEditar: reserva.item,
                idUser: this.props.location.state.idUser
              }
            }}
          ><Button size="small" color="primary">
              Ver Item
              </Button></Link>

        </div>
      </CardActions>);
    } else if (reserva.status === 1) {
      s.push(<CardActions>
        <div>
          <Button size="small" startIcon={<ThumbUpIcon />}  color="primary" onClick={() => { this.mudaStatusReservaPos(reserva, 2) }}>
            Concluir
          </Button>
          <Button size="small" startIcon={<ThumbDownIcon />}  color="secondary" onClick={() => { this.mudaStatusReservaNeg(reserva.cod, -1) }}>
            Rejeitar
          </Button>
        </div>
      </CardActions>);
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
            this.getLocalizacao(res.item),
            this.getDataBonita(res.datainicio),
            this.getDataBonita(res.datafim),
            this.getEmpresaNome(res.empresa),
            this.getUsername(res.usuario),
            res.obs,
            this.getStatusName(res.status),
            this.assembleActions(res)
          )
        );
      });
    }

    return r;
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

  createData(item, loc, inicio, fim, empresa, usuario, obs, status, acao) {
    return [item, loc, inicio, fim, empresa, usuario, obs, status, acao];
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
                <h4>Reservas Pendentes</h4>
              </div>
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
                Opções de Filtragem
              </div>
              <div className="itemFiltro">
                Status: <select ref="statusSelect">
                  <option key='1' value='1'>Aguardando Entrega</option>
                  <option key='-1' value='-1'>Rejeitadas</option>
                </select>
              </div>
              <div className="itemFiltro">
                Empresa: <select ref="empresasSelect">
                  <option key='-1' value='-1'>Todas</option>
                  {this.returnEmpresas()}
                </select>
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
                    "Localização",
                    "Início",
                    "Fim",
                    "Empresa",
                    "Usuário",
                    "Observação",
                    "Status",
                    "Ações"
                  ])
                )}
            </div>
          </div>
        </div>
        <SimpleDialog selectedValue={this.state.newLoc} open={this.state.open} onClose={this.handleClose.bind(this)} />
      </div>
    );
  }
}

export default App;

function SimpleDialog(props) {
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = value => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">Selecione a Nova Localização deste Item</DialogTitle>
      <List>
        {salas.map(email => (
          <ListItem button onClick={() => handleListItemClick(email.cod)} key={email.cod}>
            <ListItemText primary={email.nome} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}

SimpleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { consultarItens, consultarItensQtd } from "./../../Functions/gets.js";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import { consultarTiposItens } from "./../../Functions/gets.js";
import { consultarAgendados } from "./../../Functions/gets.js";
import { KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import CircularProgress from "@material-ui/core/CircularProgress";
import AdminHeader from "../../Headers/AdminHeader";
import UserHeader from "../../Headers/UserHeader";
import { SimpleTable } from "../widgets/table.js";
import { Checkbox, FormControlLabel, TextField } from "@material-ui/core";
import urlDB from "../../dbURL";
import Location from "@material-ui/icons/EditLocation";
import Edit from "@material-ui/icons/Edit";
import Block from "@material-ui/icons/Block";
import Tooltip from "@material-ui/core/Tooltip";
import Search from "@material-ui/icons/Search";
import AddCircleIcon from '@material-ui/icons/AddCircle';

class App extends Component {
  constructor(props) {
    super(props);
    let data = new Date();
    this.checkUndefined = this.checkUndefined.bind(this);
    this.carregaItens = this.carregaItens.bind(this);
    this.doSearch = this.doSearch.bind(this);
    this.setSearch = this.setSearch.bind(this);
    this.input = null;
    data.setDate(new Date().getDate() + 1);
    this.state = {
      itens: [],
      allItens: [],
      categorias: [],
      tiposItem: [],
      selected: -1,
      salas: [],
      agendados: [],
      dateInit: new Date(),
      dateEnd: data,
      isAdmin: false,
      undefined: false,
      localizacoes: [],
      totalItens: 2,
      val: ""
    };
    this.search = "";
  }
  handleChange = event => {
    this.search = event.target.value;
  };
  inativaItem(itemCod) {
    let token = JSON.parse(localStorage.getItem("token"));
    let result = window.confirm(
      "Você tem certeza que deseja inativar o item?\n"
    );
    if (result) {
      fetch(urlDB + "inativa/item", {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          authorization: token.acess_token,
          email: token.email
        },
        body: JSON.stringify({
          cod: itemCod
        })
      })
        .then(response => response.json())
        .then(resp => {
          if (resp.requestResult === "impossivel inativar") {
            alert(
              "Não foi possível inativar o item pois está relacionado a uma reserva ativa!"
            );
          } else if (resp.requestResult === "sucesso") {
            alert("Item inativado com Sucesso!");
            window.location.reload(false);
          } else {
            alert("Ocorreu um erro, aqui vai ele: " + resp.dbError);
          }
        })
        .catch(err => console.log(err));
    }
  }

  getLocalizacao(itemCod) {
    if (this.state.isAdmin) {
      if (Array.isArray(this.state.localizacoes)) {
        let salaID = -1,
          resp = [];
        this.state.localizacoes.forEach(loc => {
          if (itemCod === loc.item) {
            salaID = loc.sala;
          }
        });
        if (salaID === -1) {
          return "S/L";
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
              >
                {sala.nome}
              </Link>
            );
          }
        });
        return resp;
      } else {
        return "S/L";
      }
    } else {
      return "";
    }
  }

  getData() {
    let token = JSON.parse(localStorage.getItem("token"));
    this.setState({ isLoading: true });

    fetch(urlDB + "localizacoes", {
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      }
    })
      .then(response => response.json())
      .then(loc => {
        fetch(urlDB + "salas", {
          headers: {
            "Content-Type": "application/json",
            authorization: token.acess_token,
            email: token.email
          }
        })
          .then(response => response.json())
          .then(sal => {
            this.setState({
              localizacoes: loc,
              salas: sal,
              isLoading: false
            });
          });
      });
    consultarTiposItens().then(res => {
      let labelsTipoItem = [];
      labelsTipoItem.push("Todos");
      res.forEach(element => {
        labelsTipoItem.push(element.descricao);
      });
      consultarAgendados().then(res => {
        this.setState({ agendados: res });
      });
      this.setState({ categorias: labelsTipoItem, tiposItem: res });
    });
  }

  componentDidMount() {
    this.getData();
    consultarItensQtd().then(res => {
      this.setState(
        {
          isAdmin: this.props.location.state.isAdmin,
          totalItens: res
        },
        () => {
          this.carregaItens();
        }
      );
    });
  }
  async carregaItens() {
    let p1;
    let p1p1;
    let p2;
    let p2p2;
    if (this.state.totalItens % 2 !== 0) {
      p1 = (this.state.totalItens - 1) / 2;
      p2 = p1 + 1;
      if (p1 % 2 === 0) {
        p1p1 = p1 / 2;
      } else {
        p1p1 = (p1 - 1) / 2;
      }
      if (p2 % 2 === 0) {
        p2p2 = p2 / 2;
      } else {
        p2p2 = (p2 - 1) / 2;
      }
    } else {
      p1 = this.state.totalItens / 2;
      p2 = p1;
      if (p1 % 2 === 0) {
        p1p1 = p1 / 2;
      } else {
        p1p1 = (p1 - 1) / 2;
      }
      if (p2 % 2 === 0) {
        p2p2 = p2 / 2;
      } else {
        p2p2 = (p2 - 1) / 2;
      }
    }

    consultarItens(p1p1).then(async res => {
      this.setState(
        {
          itens: res,
          allItens: res
        },
        () => {
          consultarItens(p1).then(async res => {
            this.setState(
              {
                itens: res,
                allItens: res
              },
              () => {
                consultarItens(p1 + p2p2).then(async res => {
                  this.setState(
                    {
                      itens: res,
                      allItens: res
                    },
                    () => {
                      consultarItens(p1 + p2 + 2).then(async res => {
                        this.setState({
                          itens: res,
                          allItens: res
                        });
                      });
                    }
                  );
                });
              }
            );
          });
        }
      );
    });
  }
  onSelect(value) {
    if (value["label"] === "Todos") {
      this.setState({ selected: -1 });
    } else {
      let select = this.state.tiposItem.find(element => {
        return element.descricao === value["label"];
      });
      this.setState({ selected: select.codigo });
    }
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
  createData(descricao, codigo, categoria, loc, acao) {
    return [descricao, codigo, categoria, loc, acao];
  }
  setSearch(val) {
    this.setState({ search: val.target.value });
  }
  doSearch() {
    if (this.search !== null && this.search !== undefined) {
      let val = this.search;

      if (
        val.length < 1 &&
        this.state.itens.length !== this.state.allItens.length
      ) {
        this.setState({ itens: this.state.allItens });
      } else {
        let itens = [];
        this.state.allItens.forEach(item => {
          if (item.descricao.toString().includes(val.toString())) {
            itens.push(item);
          }
        });
        this.setState({ itens: itens });
      }
    }
  }

  rows2() {
    let r = [];
    let agendado = [];

    this.state.agendados.forEach(agendamento => {
      let dataFim = new Date(agendamento.dataFim);
      let dateInicio = new Date(agendamento.dataInicio);
      if (this.state.undefined) {
        if (dataFim < this.state.dateInit || dateInicio < this.state.dateInit) {
          agendado.push(agendamento.item);
        }
      } else {
        if (
          dataFim >= this.state.dateEnd &&
          dateInicio <= this.state.dateInit
        ) {
          agendado.push(agendamento.item);
        } else if (
          agendamento.dataFim >= this.state.dateEnd &&
          dateInicio <= this.state.dateInit
        ) {
          agendado.push(agendamento.item);
        } else if (
          dataFim >= this.state.dateInit &&
          dateInicio <= this.state.dateInit
        ) {
          agendado.push(agendamento.item);
        }
      }
    });
    this.state.itens.forEach(item => {
      if (item.ativo) {
        if (
          this.state.selected === -1 ||
          this.state.selected === item.tipoitem
        ) {
          if (
            agendado.find(function(element) {
              return element === item.codigo;
            }) !== item.codigo
          ) {
            let val = this.state.tiposItem.find(function(element) {
              return element.codigo === item.tipoitem;
            });
            r.push(
              this.createData(
                item.descricao,
                item.codigo,
                val != null ? val.descricao : "",
                this.getLocalizacao(item.codigo),
                <CardActions>
                  <Link
                    to={{
                      pathname: "/reserva",
                      state: {
                        idEditar: item.codigo,
                        dataFim: this.state.dateEnd,
                        dataInicio: this.state.dateInit,
                        idUser: this.props.location.state.idUser,
                        isAdmin: this.state.isAdmin,
                        undefined: this.state.undefined
                      }
                    }}
                  >
                    <Button size="small" color="primary">
                      Reservar
                    </Button>
                  </Link>
                  {this.state.isAdmin && (
                    <div>
                      <Link
                        to={{
                          pathname: "/novo/item",
                          state: {
                            idEditar: item.codigo,
                            idUser: this.props.location.state.idUser
                          }
                        }}
                      >
                        <Tooltip title="Editar Item" aria-label="add">
                          <IconButton size="small" color="secondary">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </Link>
                      <Link
                        to={{
                          pathname: "/novo/localizacao",
                          state: {
                            idItem: item.codigo,
                            idUser: this.props.location.state.idUser,
                            isAdmin: true
                          }
                        }}
                      >
                        <Tooltip
                          title="Editar localização do item"
                          aria-label="add"
                        >
                          <IconButton size="small">
                            <Location />
                          </IconButton>
                        </Tooltip>
                      </Link>
                      <Tooltip title="Inativar item" aria-label="add">
                        <IconButton
                          size="small"
                          variant="outlined"
                          color="deafult"
                          onClick={() => this.inativaItem(item.codigo)}
                        >
                          <Block />{" "}
                        </IconButton>
                      </Tooltip>
                    </div>
                  )}
                </CardActions>
              )
            );
          }
        }
      }
    });
    return r;
  }
  checkUndefined() {
    this.setState({ undefined: !this.state.undefined });
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
                      pathname: "/novo/item",
                      state: {
                        idUser: this.props.location.state.idUser
                      }
                    }}
                  >
                    <br />
                    <Button startIcon={<AddCircleIcon />} fullWidth variant="contained" color="primary">
                      Novo Item
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
                <div style={{ width: "100%" }}>
                  <TextField
                    id="searcher"
                    label="Pesquisar"
                    onChange={this.handleChange}
                    style={{ width: "80%" }}
                  ></TextField>
                  <IconButton
                    size="small"
                    onClick={() => {
                      this.doSearch();
                    }}
                    style={{ width: "20%", verticalAlign: "bottom" }}
                  >
                    <Search />
                  </IconButton>
                </div>
              </div>
              <div className="itemFiltro">
                <div className="categoria" style={{ fontSize: "10pt" }}>
                  Categoria:{" "}
                </div>
                <Dropdown
                  className="categoria"
                  controlClassName="myControlClassName"
                  label="Categorias"
                  options={this.state.categorias}
                  onChange={this.onSelect.bind(this)}
                  value={"Todos"}
                  placeholder="Select an option"
                />
              </div>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <div className="itemFiltro">
                  <KeyboardDatePicker
                    margin="normal"
                    id="date-picker-dialog"
                    minDate={Date()}
                    label="Data de Emprestimo"
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
                    disabled={this.state.undefined}
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.undefined}
                        onChange={this.checkUndefined}
                        value="undefined"
                      />
                    }
                    label="Indefinido"
                  />
                </div>
              </MuiPickersUtilsProvider>
            </div>
            <div className="itens">
              {SimpleTable(this.rows2(), [
                "Descrição",
                "Código",
                "Categoria",
                "Localização",
                "Opções"
              ])}
              {this.state.itens.length < this.state.totalItens - 1 && (
                <div style={{ marginLeft: "45%" }}>
                  <CircularProgress disableShrink />{" "}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

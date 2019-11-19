import React, { Component } from "react";
import { Link } from "react-router-dom";
import AdminHeader from "../../Headers/AdminHeader";
import Button from "@material-ui/core/Button";
import "react-dropdown/style.css";
import { KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import CircularProgress from "@material-ui/core/CircularProgress";
import { SimpleTable } from "../widgets/table.js";
import urlDB from '../../dbURL';
import jsPDF from 'jspdf'
import { relatorio101, relatorio102, relatorio103, relatorio104, relatorio105, relatorio106, relatorio201, relatorio202, relatorio203, relatorio204, relatorio205, relatorio301, relatorio302, relatorio401, relatorio402, relatorio403, relatorio404, relatorio405, relatorio406, relatorio407, relatorio408 } from "../../Functions/relatorios.js";
import DescriptionIcon from '@material-ui/icons/Description';
import SearchIcon from '@material-ui/icons/Search';
import DateRangeIcon from '@material-ui/icons/DateRange';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';

class App extends Component {
  constructor(props) {
    super(props);
    this.getData = this.getData.bind(this);
    this.getDataBonita = this.getDataBonita.bind(this);
    this.getUsername = this.getUsername.bind(this);
    this.onChangeNumero = this.onChangeNumero.bind(this);
    this.onChangeCategoria = this.onChangeCategoria.bind(this);
    let data1 = new Date();
    let data2 = new Date();
    data2.setDate(new Date().getDate() + 1);
    this.state = {
      users: [],
      tipoItens: [],
      empresas: [],
      salas: [],
      isLoading: false,
      isAdmin: false,
      dateInit: data1,
      dateEnd: data2,
      dataUnica: data1,
      reservas: [],
      numeroRelatorio: 0,
      catRelatorio: "Todas",
      habilitaCampo1: true,
      habilitaCampo2: true,
      relatorios: [],
    };
  }

  getData() {
    let token = JSON.parse(localStorage.getItem("token"));
    this.setState({ isLoading: true });
    fetch(urlDB + "tipoitens", {
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      }
    })
      .then(response => response.json())
      .then(titens => {
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
                    this.setState({ users: usu, tipoItens: titens, salas: sala, empresas: emp })
                  });
              });
          });
      });
  }

  componentDidMount() {
    this.getData();
    this.setState({ isAdmin: this.props.location.state.isAdmin, relatorios: this.rows() });
    this.refs.filenameField.value = "Relatório";
  }

  getEmpresaNome(codEmpresa) {
    let resp;
    this.state.empresas.forEach(emp => {
      if (parseInt(codEmpresa) === emp.cod) {
        resp = emp.nome;
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

  gerar(numRelat) {
    let doc;
    if (numRelat === '101') {
      let ativo = this.refs.filtroSelect101.value;
      relatorio101(ativo).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '102') {
      relatorio102().then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '103') {
      let empresa = this.refs.empresasSelect103.value;
      relatorio103(empresa).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '104') {
      relatorio104().then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '105') {
      let empresa = this.refs.empresasSelect105.value;
      let d1 = new Date(this.state.dateInit), d2 = new Date(this.state.dateEnd), indef = this.refs.incluirIndefCbox105.checked;
      relatorio105(empresa, d1, d2, indef).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '106') {
      let cat = this.refs.categoriaSelect106.value;
      let catName = this.state.tipoItens[cat - 1].descricao;
      relatorio106(cat, catName).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '201') {
      let disp = this.refs.dispSelect201.value;
      relatorio201(disp).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '202') {
      let sal = this.refs.salaSelect202.value;
      relatorio202(sal).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '203') {
      let sal = this.refs.salaSelect203.value, b, c = new Date(this.state.dataUnica);
      this.state.salas.forEach(salinha => {
        if (parseInt(sal) === salinha.cod) {
          b = salinha.nome;
        }
      });
      relatorio203(sal, b, c).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '204') {
      let sal = this.refs.salaSelect204.value, b, c1 = new Date(this.state.dateInit), c2 = new Date(this.state.dateEnd);
      this.state.salas.forEach(salinha => {
        if (parseInt(sal) === salinha.cod) {
          b = salinha.nome;
        }
      });
      relatorio204(sal, b, c1, c2).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '205') {
      let emp = this.refs.empresasSelect205.value, name;
      this.state.empresas.forEach(empresa => {
        if (parseInt(emp) === empresa.cod) {
          name = empresa.nome;
        }
      });
      relatorio205(emp, name).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '301') {
      let at = this.refs.filtroSelect301.value;
      relatorio301(at).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '302') {
      relatorio302().then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '401') {
      let emp = this.refs.empresasSelect401.value, b = "Todas", c1 = new Date(this.state.dateInit), c2 = new Date(this.state.dateEnd);
      this.state.empresas.forEach(empresa => {
        if (parseInt(emp) === empresa.cod) {
          b = empresa.nome;
        }
      });
      relatorio401(emp, b, c1, c2).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '402') {
      let emp = this.refs.empresasSelect402.value, b;
      this.state.empresas.forEach(empresa => {
        if (parseInt(emp) === empresa.cod) {
          b = empresa.nome;
        }
      });
      relatorio402(emp, b).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '403') {
      let emp = this.refs.empresasSelect403.value, b = "Todas", c1 = new Date(this.state.dateInit), c2 = new Date(this.state.dateEnd);
      this.state.empresas.forEach(empresa => {
        if (parseInt(emp) === empresa.cod) {
          b = empresa.nome;
        }
      });
      relatorio403(emp, b, c1, c2).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '404') {
      relatorio404().then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '405') {
      let emp = this.refs.empresasSelect405.value, b = "Todas", c1 = new Date(this.state.dateInit);
      this.state.empresas.forEach(empresa => {
        if (parseInt(emp) === empresa.cod) {
          b = empresa.nome;
        }
      });
      relatorio405(emp, b, c1).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '406') {
      let emp = this.refs.empresasSelect406.value, b = "Todas", c1 = new Date(this.state.dateInit);
      this.state.empresas.forEach(empresa => {
        if (parseInt(emp) === empresa.cod) {
          b = empresa.nome;
        }
      });
      relatorio406(emp, b, c1).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '407') {
      let emp = this.refs.empresasSelect407.value, b = "Todas"
      this.state.empresas.forEach(empresa => {
        if (parseInt(emp) === empresa.cod) {
          b = empresa.nome;
        }
      });
      relatorio407(emp, b).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else if (numRelat === '408') {
      let emp = this.refs.empresasSelect408.value, b = "Todas", c1 = new Date(this.state.dateInit);
      this.state.empresas.forEach(empresa => {
        if (parseInt(emp) === empresa.cod) {
          b = empresa.nome;
        }
      });
      relatorio408(emp, b, c1).then(doc => {
        doc.save(this.refs.filenameField.value + ".pdf");
      })
    } else {
      doc = new jsPDF();
      doc.setFont("times");
      alert("Relatório Inexistente kkkk.")
    }
  }

  rows() {
    let r = [], p1 = [], p2 = [], acao = [];
    // 101
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("101")}>Gerar</Button>
    );
    p1.push(
      < div >
        Filtrar: <select ref="filtroSelect101">
          <option key={0} value={0}>Todos</option>
          <option key={1} value={1}>Ativos</option>
          <option key={2} value={2}>Inativos</option>
        </select>
      </div >
    );
    r.push(
      this.createData(
        "101", "Itens", "Listagem de Itens", "Listagem de Todos os Itens, de acordo com o filtro selecionado.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 102
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("102")}>Gerar</Button>
    );

    r.push(
      this.createData(
        "102", "Itens", "Listagem de Categorias", "Listagem de Todas as Categorias.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 103
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("103")}>Gerar</Button>
    );
    p1.push(
      < div >
        Empresa: <select ref="empresasSelect103">
          <option key={-1} value={-1}>Todas</option>
          {this.returnEmpresas()}
        </select>
      </div >
    );
    r.push(
      this.createData(
        "103", "Itens", "Itens Reservados", "Listagem de Itens reservados atualmente, permite filtro por Empresa.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 104
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("104")}>Gerar</Button>
    );
    r.push(
      this.createData(
        "104", "Itens", "Itens sem Reserva", "Listagem de Itens não reservados atualmente.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 105
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("105")}>Gerar</Button>
    );
    p1.push(
      < div >
        Empresa: <select ref="empresasSelect105">
          <option key={-1} value={-1}>Todas</option>
          {this.returnEmpresas()}
        </select>
      </div >
    );
    p2.push(
      <div>
        <input type='checkbox' ref="incluirIndefCbox105" /> Incluir Indefinidos
      </div>
    );
    r.push(
      this.createData(
        "105", "Itens", "Itens Reservados por Empresa e período", "Listagem de Itens reservados, filtrados por Empresa e período.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 106
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("106")}>Gerar</Button>
    );
    p1.push(
      < div >
        Categoria: <select ref="categoriaSelect106">
          {this.returnCategorias()}
        </select>
      </div >
    );
    r.push(
      this.createData(
        "106", "Itens", "Itens por Categoria", "Listagem de Itens ativos, por Categoria.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 201
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("201")}>Gerar</Button>
    );
    p1.push(
      < div >
        Disponibilidade: <select ref="dispSelect201">
          <option key={0} value={0}>Todas</option>
          <option key={1} value={1}>Disponíveis</option>
          <option key={2} value={2}>Indisponíveis</option>
        </select>
      </div >
    );
    r.push(
      this.createData(
        "201", "Salas", "Listagem de Salas", "Listagem de Todas as Salas, de acordo com sua Disponibilidade.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 202
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("202")}>Gerar</Button>
    );
    p1.push(
      < div >
        Sala: <select ref="salaSelect202">
          {this.returnSalas()}
        </select>
      </div >
    );
    r.push(
      this.createData(
        "202", "Salas", "Itens por Sala", "Listagem de Itens de acordo com sua Localização.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 203
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("203")}>Gerar</Button>
    );
    p2.push(
      < div >
        Sala: <select ref="salaSelect203">
          {this.returnSalas()}
        </select>
      </div >
    );
    p1.push(
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          margin="normal"
          id="date-picker-dialog"
          label="Dia"
          format="dd/MM/yyyy"
          value={this.state.dateUnica}
          onChange={this.onChangeUnica.bind(this)}
          KeyboardButtonProps={{
            "aria-label": "change date"
          }}
        />
      </MuiPickersUtilsProvider>
    );
    r.push(
      this.createData(
        "203", "Salas", "Reservas de Sala por dia", "Relação de Reservas de uma Sala por Dia.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 204
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("204")}>Gerar</Button>
    );
    p1.push(
      < div >
        Sala: <select ref="salaSelect204">
          {this.returnSalas()}
        </select>
      </div >
    );
    r.push(
      this.createData(
        "204", "Salas", "Reservas de Sala por período", "Relação de Reservas de uma Sala por período.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 205
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("205")}>Gerar</Button>
    );
    p1.push(
      < div >
        Empresa: <select ref="empresasSelect205">
          {this.returnEmpresas()}
        </select>
      </div >
    );
    r.push(
      this.createData(
        "205", "Salas", "Reservas de Sala por Empresa", "Relação de Reservas futuras de salas por Empresa.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 301
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("301")}>Gerar</Button>
    );
    p1.push(
      < div >
        Filtrar: <select ref="filtroSelect301">
          <option key={0} value={0}>Todos</option>
          <option key={1} value={1}>Ativos</option>
          <option key={2} value={2}>Inativos</option>
        </select>
      </div >
    );
    r.push(
      this.createData(
        "301", "Usuários e Empresas", "Listagem de Usuários", "Listagem de Todos os Usuários, de acordo com o filtro selecionado.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 302
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("302")}>Gerar</Button>
    );
    r.push(
      this.createData(
        "302", "Usuários e Empresas", "Listagem de Empresas", "Listagem de Todas as Empresas.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 401
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("401")}>Gerar</Button>
    );
    p1.push(
      < div >
        Empresa: <select ref="empresasSelect401">
          <option key={-1} value={-1}>Todas</option>
          {this.returnEmpresas()}
        </select>
      </div >
    );
    r.push(
      this.createData(
        "401", "Reservas", "Reservas de Item por Período", "Listagem de Itens reservados por período, permite filtro por Empresa.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 402
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("402")}>Gerar</Button>
    );
    p1.push(
      < div >
        Empresa: <select ref="empresasSelect402">
          {this.returnEmpresas()}
        </select>
      </div >
    );
    r.push(
      this.createData(
        "402", "Reservas", "Reservas de Item Futuras", "Listagem de Reservas de Item futuras", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 403
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("403")}>Gerar</Button>
    );
    p1.push(
      < div >
        Empresa: <select ref="empresasSelect403">
          <option key={-1} value={-1}>Todas</option>
          {this.returnEmpresas()}
        </select>
      </div >
    );
    r.push(
      this.createData(
        "403", "Reservas", "Reservas de Salas por Período", "Listagem de Salas reservadas por período, permite filtro por Empresa.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 404
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("404")}>Gerar</Button>
    );
    r.push(
      this.createData(
        "404", "Reservas", "Reservas Pendentes", "Listagem de Reservas de Item pendentes.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 405
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("405")}>Gerar</Button>
    );
    p1.push(
      < div >
        Empresa: <select ref="empresasSelect405">
          <option key={-1} value={-1}>Todas</option>
          {this.returnEmpresas()}
        </select>
      </div >
    );
    r.push(
      this.createData(
        "405", "Reservas", "Reservas Ativas", "Listagem de Reservas de Item Ativas a partir da data inicial, permite filtro por empresa.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 406
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("406")}>Gerar</Button>
    );
    p1.push(
      < div >
        Empresa: <select ref="empresasSelect406">
          <option key={-1} value={-1}>Todas</option>
          {this.returnEmpresas()}
        </select>
      </div >
    );
    r.push(
      this.createData(
        "406", "Reservas", "Reservas Rejeitadas", "Listagem de Reservas de Item Rejeitadas a partir da data inicial, permite filtro por empresa.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 407
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("407")}>Gerar</Button>
    );
    p1.push(
      < div >
        Empresa: <select ref="empresasSelect407">
          <option key={-1} value={-1}>Todas</option>
          {this.returnEmpresas()}
        </select>
      </div >
    );
    r.push(
      this.createData(
        "407", "Reservas", "Reservas Atrasadas", "Listagem de Reservas de Item Atrasadas, permite filtro por empresa.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    // 408
    acao.push(
      <Button startIcon={<AutorenewIcon />} variant='contained' color='primary' size='small' onClick={() => this.gerar("408")}>Gerar</Button>
    );
    p1.push(
      < div >
        Empresa: <select ref="empresasSelect408">
          <option key={-1} value={-1}>Todas</option>
          {this.returnEmpresas()}
        </select>
      </div >
    );
    r.push(
      this.createData(
        "408", "Reservas", "Reservas Devolvidas", "Listagem de Reservas de Item Devolvidas a partir da data inicial, permite filtro por empresa.", p1[0], p2[0], acao[0]
      )
    );
    p1 = []; p2 = []; acao = []; //reseta variaveis para o proximo relatorio

    let indices = {
      "101": 0,
      "102": 1,
      "103": 2,
      "104": 3,
      "105": 4,
      "106": 5,
      "201": 6,
      "202": 7,
      "203": 8,
      "204": 9,
      "205": 10,
      "301": 11,
      "302": 12,
      "401": 13,
      "402": 14,
      "403": 15,
      "404": 16,
      "405": 17,
      "406": 18,
      "407": 19,
      "408": 20
    };

    if (this.state.catRelatorio !== "Todas") {
      if (this.state.catRelatorio === "Itens") {
        r = r.slice(0, 6);
      } else if (this.state.catRelatorio === "Salas") {
        r = r.slice(6, 11);
      } else if (this.state.catRelatorio === "Usuários e Empresas") {
        r = r.slice(11, 13);
      } else if (this.state.catRelatorio === "Reservas") {
        r = r.slice(13, 21);
      } 
    } else if (this.state.numeroRelatorio !== 0) {
      r = r.slice(indices[this.state.numeroRelatorio], indices[this.state.numeroRelatorio] + 1);
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
      r.push(
        <option key={emp.cod} value={emp.cod}>{emp.nome}</option>
      );
    });
    return r;
  }

  returnSalas() {
    let r = [];
    this.state.salas.forEach(s => {
      r.push(
        <option key={s.cod} value={s.cod}>{s.nome}</option>
      );
    });
    return r;
  }

  returnCategorias() {
    let r = [];
    this.state.tipoItens.forEach(t => {
      r.push(
        <option key={t.cod} value={t.cod}>{t.descricao}</option>
      );
    });
    return r;
  }

  createData(num, cat, nome, desc, param1, param2, acao) {
    return [<b>{num}</b>, cat, <b>{nome}</b>, desc, param1, param2, acao];
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

  onChangeUnica(unic) {
    this.setState({ dataUnica: unic });
  }

  onChangeNumero(num) {
    if (num.target.value === "") {
      this.setState({ numeroRelatorio: 0, habilitaCampo2: true });
    } else {
      this.setState({ numeroRelatorio: num.target.value, habilitaCampo2: false });
    }
  }

  onChangeCategoria(cat) {
    if (cat.target.value === "Todas") {
      this.setState({ catRelatorio: cat.target.value, habilitaCampo1: true });
    } else {
      this.setState({ catRelatorio: cat.target.value, habilitaCampo1: false });
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
                <Button startIcon={<DescriptionIcon />} variant='contained' fullWidth color='secondary' size='large'>Relatórios</Button>
                <div className='itemFiltro' style={{ textAlign: "center" }}>
                  <Button startIcon={<SearchIcon />} variant='contained' fullWidth color='primary' size='medium'>Filtrar</Button>
                </div>
                <div style={{ textAlign: "center" }}>
                  <TextField
                    id="numeroRelati"
                    label="Número do Relatório"
                    onChange={this.onChangeNumero}
                    type="number"
                    disabled={!(this.state.habilitaCampo1)}
                    margin="normal"
                  />
                </div>
                <div style={{ textAlign: "center" }}>
                  <b>OU</b>
                </div>
                <div className='itemFiltro' style={{ textAlign: "center" }}>
                  <InputLabel htmlFor="cat-simple">Categoria</InputLabel>
                  <Select onChange={this.onChangeCategoria} value={this.state.catRelatorio} disabled={!(this.state.habilitaCampo2)} name="categoriaSelect">
                    <MenuItem value="Todas">
                      <em>Todas</em>
                    </MenuItem>
                    <MenuItem value={"Itens"}>Itens</MenuItem>
                    <MenuItem value={"Salas"}>Salas</MenuItem>
                    <MenuItem value={"Usuários e Empresas"}>Usuários e Empresas</MenuItem>
                    <MenuItem value={"Reservas"}>Reservas</MenuItem>
                  </Select>
                </div>
              </div>
              <div className='itemFiltro' style={{ textAlign: "center" }}>
                <Button startIcon={<DateRangeIcon />} variant='contained' fullWidth color='primary' size='medium'>Período</Button>
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
                <Button startIcon={<PictureAsPdfIcon />} variant='contained' fullWidth color='primary' size='medium'>Nome do Arquivo</Button>
              </div>
              <div className='itemFiltro' style={{ textAlign: "center" }}>
                <input style={{width:125}} type='text' ref='filenameField' /> <b>.pdf</b>
              </div>

            </div>

            <div className="itens">
              {this.state.salas.length < 1 ? (
                <div className="loading">
                  <CircularProgress disableShrink />{" "}
                </div>
              ) : (
                  SimpleTable(this.rows(), [
                    "Número",
                    "Categoria",
                    "Nome",
                    "Descrição",
                    "Parâmetros",
                    "",
                    "Ação",
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

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import 'react-dropdown/style.css'
import CircularProgress from '@material-ui/core/CircularProgress';
import AdminHeader from '../../Headers/AdminHeader';
import { SimpleTable } from '../widgets/table.js';
import urlDB from '../../dbURL';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      itens: [],
      tipoItens: [],
      isAdmin: false,
      isEmpty: false,
    }
  }

  getData() {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB + 'itensBySala', {
      method: 'post',
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      },
      body: JSON.stringify({
        sala: this.props.location.state.idSala,
      })
    }).then(response => response.json()).then(itens => {
      if (Array.isArray(itens)) {
        fetch(urlDB + 'tipoitens', {
          headers: {
            "Content-Type": "application/json",
            authorization: token.acess_token,
            email: token.email
          }
        })
          .then(response => response.json())
          .then(tipos => this.setState({ tipoItens: tipos, itens: itens }));
      } else {
        if (itens.dbError !== "não tem nenhum item nessa sala") {
          alert("Ocorreu uma acontecimento incorreto: " + itens.dbError);
        } else {
          this.setState({ isEmpty: true });
        }
      }
    }).catch(err => console.log(err));
  }

  componentDidMount() {
    this.getData();
    this.setState({ isAdmin: this.props.location.state.isAdmin });
  }

  createData(descricao, codigo, categoria, acao) {
    return [descricao, codigo, categoria, acao];
  }
  rows2() {
    let r = []
    this.state.itens.forEach((item) => {
      if (item.ativo) {
        let val = this.state.tipoItens.find(function (element) {
          return element.cod === item.tipoitem;
        })
        r.push(
          this.createData(item.descricao, item.cod, val != null ? val.descricao : '',
            <CardActions>
              <Link to={{
                pathname: '/novo/item',
                state: {
                  idEditar: item.cod,
                  idUser: this.props.location.state.idUser
                }
              }}><Button size="small" color="secondary">
                  Editar
            </Button></Link>
              <Link to={{
                pathname: '/novo/localizacao',
                state: {
                  idItem: item.cod,
                  idUser: this.props.location.state.idUser,
                  isAdmin: true,
                }
              }}><Button size="small" color="primary">
                  Alterar Localização
            </Button></Link>

            </CardActions>
          )
        )
      }
    })
    return r
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
                    pathname: "/novo/sala",
                    state: {
                      idSala: this.props.location.state.idSala,
                      idUser: this.props.location.state.idUser
                    }
                  }}
                >
                  <Button variant='contained' size='large' fullWidth color='primary'>{this.props.location.state.salaNome}</Button>
                </Link>
              </div>
            </div>
            {
              this.state.isEmpty &&
              <div className="itens">
                <h1 style={{margin: 10}}>Esta sala não possui itens...</h1>
                <Button onClick={() => window.history.back()} variant='contained' color='secondary' size='large' style={{margin: 10}}>Voltar</Button></div>
            }{
              !this.state.isEmpty &&
              <div className="itens">{this.state.itens.length < 1 ? <div className="loading">
                <CircularProgress disableShrink /> </div> :
                SimpleTable(this.rows2(), ['Descrição', 'Código', 'Categoria', 'Opções'])}</div>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default App;
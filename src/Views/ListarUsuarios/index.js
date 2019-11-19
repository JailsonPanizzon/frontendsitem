
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AdminHeader from '../../Headers/AdminHeader'
import urlDB from '../../dbURL';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Edit from "@material-ui/icons/Edit";
import Delete from "@material-ui/icons/Delete";

class App extends Component {

  constructor(props) {
    super(props);
    this.getData = this.getData.bind(this);
    this.getEmpresaName = this.getEmpresaName.bind(this);
    this.inativarUsuario = this.inativarUsuario.bind(this);
    this.state = {
      users: [],
      empresas: [],
      isLoading: false,
    }
  }

  getData() {
    let token = JSON.parse(localStorage.getItem("token"));
    this.setState({ isLoading: true })
    fetch(urlDB+'usuarios', {
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      }
    }).then(response => response.json())
      .then(itens => {
        this.setState({ users: itens });
      }).then(() => {
        fetch(urlDB+'empresas', {
          headers: {
            "Content-Type": "application/json",
            authorization: token.acess_token,
            email: token.email
          }
        }).then(response => response.json())
          .then(aas => {
            this.setState({ empresas: aas });
          })
      })
    this.setState({ isLoading: false })
  }

  getEmpresaName(empresaCod) {
    let nome;
    this.state.empresas.forEach((empresa) => {
      if (empresa.cod === empresaCod) {
        nome = empresa.nome;
      }
    });
    return nome;
  }

  componentDidMount() {
    this.getData();
    this.setState({ isAdmin: this.props.location.state.isAdmin });
  }

  inativarUsuario(codinho) {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB+'inativa/usuario', {
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
        window.location.reload(false);
      } else {
        alert("Deu ruim, aqui deixo a você um erro de presente: " + resposta.dbError);
        console.log(resposta.dbError);
      }
    }).catch(err => console.log(err));
  }

  rows() {
    let r = []
    this.state.users.forEach((user) => {
      r.push(
        <Card key={user.cod}>
          <CardActionArea>
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                {user.nome}
              </Typography>
              {
                user.isadmin &&
                <Typography variant="body1" component="h6">ADMINISTRADOR</Typography>
              }
              <Typography variant="body2" color="textSecondary" component="p">
                Email: {user.email}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                Telefone: {user.telefone}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                Endereço: {user.logradouro + ", " + user.numeroend + ", Bairro " + user.bairro + " - " + user.cidade + "/" + user.uf}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                Empresa: {this.getEmpresaName(user.empresa)}
              </Typography>
            </CardContent>
          </CardActionArea>
          <CardActions>
            {
              user.cod !== 0 &&
              <div>
                <Link to={{
                  pathname: '/novo/usuario',
                  state: {
                    idEUser: user.cod,
                    idUser: this.props.location.state.idUser,
                  }
                }}><Button startIcon={<Edit />} style={{marginRight: 5}} variant="contained" size="medium" color="primary">
                    Editar
          </Button></Link>
                <Button startIcon={<Delete />} onClick={(e) => { if (window.confirm('Você tem certeza que deseja inativar o usuário: ' + user.nome + '?\nEste procedimento é "irreversível"!')) this.inativarUsuario(user.cod) }} variant="contained" size="medium" color="default">
                  Inativar
          </Button>
              </div>
            }

          </CardActions>
        </Card>
      );
    }
    )
    return r
  }

  render() {
    return (
      <div>
        {
          this.state.isAdmin &&
          <div>
            <AdminHeader idUser={this.props.location.state.idUser} />
            <div style={{ textAlign: 'center' }}>
              <Link to={{
                pathname: '/novo/usuario',
                state: {
                  idUser: this.props.location.state.idUser
                }
              }}>
                <br /><Button startIcon={<AddCircleIcon />} variant="contained" size='large' color="primary">Novo Usuário</Button></Link>
            </div>
          </div>
        }
        <div className='Lista'>
          {
            this.state.isLoading &&
            <h1>Carregando Usuários...</h1>
          }
          {
            !this.state.isLoading &&
            <ul>{this.rows()}</ul>
          }
        </div>
      </div>

    )
  }
}

export default App;
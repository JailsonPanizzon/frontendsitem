import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Button from "@material-ui/core/Button";
import urlDB from '../../dbURL';
import DesktopMacIcon from '@material-ui/icons/DesktopMac';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import GroupIcon from '@material-ui/icons/Group';
import DescriptionIcon from '@material-ui/icons/Description';
import BusinessIcon from '@material-ui/icons/Business';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

class App extends Component {

  constructor(props) {
    super(props);
    this.getUserName = this.getUserName.bind(this);
    this.state = {
      currentUserID: -1,
      currentUserName: "",
    }
  }

  componentDidMount() {
    var codinho = this.props.idUser;
    this.setState({ currentUserID: codinho }, () => this.getUserName(codinho));
  }

  getUserName(codinho) {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB + 'getAdminNome', {
      method: 'post',
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      },
      body: JSON.stringify({
        cod: codinho,
      })
    }).then(response => response.json()).then(user => {
      if (Array.isArray(user)) {
        fetch(urlDB + 'empresaNameByUser', {
          method: 'post',
          headers: {
            "Content-Type": "application/json",
            authorization: token.acess_token,
            email: token.email
          },
          body: JSON.stringify({
            user: codinho,
          })
        }).then(response => response.json()).then(emp => {
          if (Array.isArray(emp)) {
            this.setState({ currentUserName: user[0].nome, currentEmpresaName: emp[0].nome });
          } else {
            console.log(user.dbError);
          }
        }).catch(err => console.log(err));
      } else {
        console.log(user.dbError);
      }
    }).catch(err => console.log(err));
  }

  render() {

    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <Link to={{
          pathname: "/homeAdmin",
          state: {
            idUser: this.props.idUser,
            isAdmin: true
          } 
        }}><img src="../images/Banner.png" height="30" alt="" /></Link>


        <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
          <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
            <li className="nav-item">
              <Link to={{
                pathname: "/itens",
                state: {
                  idUser: this.props.idUser,
                  isAdmin: true
                }
              }}><Button color='primary' startIcon={<DesktopMacIcon />} variant='outlined' size='medium' style={{ marginTop: 3, marginLeft: 10 }}>Itens</Button>
              </Link>
            </li>
            <li className="nav-item active">
              <Link to={{
                pathname: "/salas",
                state: {
                  idUser: this.props.idUser,
                  isAdmin: true
                }
              }}><Button color='primary' startIcon={<MeetingRoomIcon />} variant='outlined' size='medium' style={{ marginTop: 3, marginLeft: 5 }}>Salas</Button>
              </Link>
            </li>
            <li className="nav-item active">
              <Link to={{
                pathname: "/usuarios",
                state: {
                  idUser: this.props.idUser,
                  isAdmin: true
                }
              }}><Button color='primary' startIcon={<GroupIcon />} variant='outlined' size='medium' style={{ marginTop: 3, marginLeft: 5 }}>Usuários</Button>
              </Link>
            </li>
            <li className='nav-item active'>
              <Link
                to={{
                  pathname: "/relatorios",
                  state: {
                    idUser: this.props.idUser,
                    isAdmin: true
                  }
                }}><Button color='primary' startIcon={<DescriptionIcon />} variant='outlined' size='medium' style={{ marginTop: 3, marginLeft: 5 }}>Relatórios</Button>
              </Link>
            </li>
          </ul>
          <Button startIcon={<BusinessIcon />} disableTouchRipple variant='contained' size='medium' color='secondary' style={{ marginRight: 5 }}>{this.state.currentEmpresaName}</Button>
          <Link to={{
            pathname: "/minhaConta",
            state: {
              idUser: this.props.idUser,
              idEUser: this.props.idUser,
              isAdmin: true,
            }
          }}><Button startIcon={<AccountCircleIcon />} variant='contained' size='medium' color='primary'>{this.state.currentUserName}</Button></Link>
          <Link to={{
            pathname: "/",
          }}><Button startIcon={<ExitToAppIcon />} color='default' size='medium' style={{ marginTop: 3, marginLeft: 5 }}>Sair</Button>
            </Link>

        </div>
      </nav>
    );
  }
}

export default App;
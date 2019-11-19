import React from 'react';
import Login from './Views/Login'
import ListarItens from './Views/ListarItens'
import CadastroItem from './Views/CadastroItem'
import CadastroTipoItem from './Views/CadastroTipoItem'
import ConfirmaReserva from './Views/ConfirmaReserva'
import CadastroSala from './Views/CadastroSala'
import ListarUsuarios from './Views/ListarUsuarios'
import CadastroUsuario from './Views/CadastroUsuario'
import CadastroEmpresa from './Views/CadastroEmpresa'
import ListarSalas from './Views/ListarSalas'
import ConfirmaReservaSala from './Views/ConfirmaReservaSala'
import ListarItensBySala from './Views/ListarItensBySala'
import CadastroLocalizacao from './Views/CadastroLocalizacao'
import HomeAdmin from './Views/HomeAdmin'
import ListarReservasSala from './Views/ListarReservasSala'
import ListarReservas from './Views/ListarReservas'
import ReservasPendentes from './Views/ReservasPendentes'
import HomeUser from './Views/HomeUser'
import MinhasReservasSala from './Views/MinhasReservasSala'
import MinhasReservasItem from './Views/MinhasReservasItem'
import PerfilUsuario from './Views/PerfilUsuario'
import CadastreSe from './Views/CadastreSe'
import Relatorios from './Views/Relatorios'

import { BrowserRouter as Router, Route } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';

const temaPadrao = createMuiTheme({
  palette: {
    primary: {
      main: '#00AD77',
      contrastText: '#fff',
    },
    secondary: blue,
  }
});

export default class App extends React.Component {

  render() {
    return (
      <ThemeProvider theme={temaPadrao}>
        <Router>
          <div>
            <Route exact path='/' component={Login} />
            <Route exact path='/homeAdmin' component={HomeAdmin} />
            <Route exact path='/homeUser' component={HomeUser} />
            <Route exact path='/itens' component={ListarItens} />
            <Route exact path='/novo/item' component={CadastroItem} />
            <Route exact path='/novo/categoria' component={CadastroTipoItem} />
            <Route exact path='/reserva' component={ConfirmaReserva} />
            <Route exact path='/novo/sala' component={CadastroSala} />
            <Route exact path='/usuarios' component={ListarUsuarios} />
            <Route exact path='/novo/usuario' component={CadastroUsuario} />
            <Route exact path='/novo/empresa' component={CadastroEmpresa} />
            <Route exact path='/salas' component={ListarSalas} />
            <Route exact path='/reservaSala' component={ConfirmaReservaSala} />
            <Route exact path='/itensBySala' component={ListarItensBySala} />
            <Route exact path='/novo/localizacao' component={CadastroLocalizacao} />
            <Route exact path='/reservasSala' component={ListarReservasSala} />
            <Route exact path='/reservas' component={ListarReservas} />
            <Route exact path='/reservasPendentes' component={ReservasPendentes} />
            <Route exact path='/minhasSalas' component={MinhasReservasSala} />
            <Route exact path='/meusItens' component={MinhasReservasItem} />
            <Route exact path='/minhaConta' component={PerfilUsuario} />
            <Route exact path='/registro' component={CadastreSe} />
            <Route exact path='/relatorios' component={Relatorios} />
          </div>
        </Router>
      </ThemeProvider>
    )
  };
}



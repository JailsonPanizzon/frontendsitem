import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import "../../app.css";
//import logo from "../../img/logomarca.png";
import { Redirect, Link } from "react-router-dom";
import urlDB from "../../dbURL";

export default function Login() {
  const [values, setValues] = React.useState({
    email: "",
    senha: "",
    senhaInvalida: false,
    emailInvalido: false,
    users: [],
    redirect: false,
    loggedUserID: -1,
    isAdmin: false
  });

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };

  const handleSubmit = values => {
    fetch(urlDB + "userLogin", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: values.email,
        senha: values.senha
      })
    })
      .then(response => response.json())
      .then(loginho => {
        console.log(loginho[0]);
        if (Array.isArray(loginho)) {
          let home = "/homeUser";
          if (loginho[0].isadmin) {
            home = "/homeAdmin";
          }
          console.log(loginho)
          localStorage.setItem(
            "token",
            JSON.stringify({
              admin: loginho[0].isadmin,
              acess_token: loginho[0].token,
              nome: loginho[0].nome,
              email: loginho[0].email
            })
          );
          setValues({
            ...values,
            loggedUserID: loginho[0].cod,
            redirect: home,
            isAdmin: loginho[0].isadmin
          });
        } else {
          if (loginho.dbError === "erro de autenticação") {
            alert("Usuário ou senha incorretos!");
          } else if (loginho.dbError === "usuario inativo") {
            alert("Usuário inativo!");
          } else {
            alert("Deu outro erro: " + loginho.dbError);
          }
          console.log(loginho.dbError);
        }
      })
      .catch(err => console.log(err));
  };

  const handleBlur_Senha = () => {
    setValues({
      ...values,
      senhaInvalida: values.senha.length < 6 ? true : false
    });
  };

  const handleBlur_Email = () => {
    let usuario = values.email.substring(0, values.email.indexOf("@"));
    let dominio = values.email.substring(
      values.email.indexOf("@") + 1,
      values.email.length
    );
    let emailValido =
      usuario.length >= 1 &&
      dominio.length >= 3 &&
      usuario.search("@") === -1 &&
      dominio.search("@") === -1 &&
      usuario.search(" ") === -1 &&
      dominio.search(" ") === -1 &&
      dominio.search(".") !== -1 &&
      dominio.indexOf(".") >= 1 &&
      dominio.lastIndexOf(".") < dominio.length - 1;

    setValues({ ...values, emailInvalido: emailValido ? false : true });
  };

  const theme = createMuiTheme({
    palette: {
      primary: {
        main: "#00bfa5",
        contrastText: "#ffffff"
      }
    },
    overrides: {
      MuiButton: {
        root: {
          textTransform: "none",
          fontSize: "20px",
          fontFamily: "inherit",
          fontWeight: 300
        }
      }
    }
  });

  return (
    <div>
      {values.redirect ? (
        <Redirect
          to={{
            pathname: values.redirect,
            state: {
              idUser: values.loggedUserID,
              isAdmin: values.isAdmin
            }
          }}
        />
      ) : (
        <form className="Login" noValidate autoComplete="off">
          <Card className="Card">
            <CardContent>
              <div className="Logo">
                <img src='../../../images/Banner.png' height='75' style={{padding: 10}} alt="logo" />
              </div>
              <TextField
                id="Email"
                label="Email"
                className="TextField"
                margin="normal"
                variant="outlined"
                value={values.email}
                onChange={handleChange("email")}
                onBlur={() => handleBlur_Email()}
                error={values.emailInvalido}
              />
              <TextField
                id="Senha"
                label="Senha"
                className="TextField"
                margin="normal"
                variant="outlined"
                type="password"
                value={values.senha}
                onChange={handleChange("senha")}
                onBlur={() => handleBlur_Senha()}
                error={values.senhaInvalida}
              />
              <div className="Link">
                <Link to="/registro">
                  <div>Cadastre-se</div>
                </Link>
              </div>
              <ThemeProvider theme={theme}>
                <Button
                  variant="contained"
                  className="Botao"
                  color="primary"
                  onClick={() => handleSubmit(values)}
                >
                  Entrar
                </Button>
              </ThemeProvider>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}

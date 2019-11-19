import { Item } from "../Models/item.js";
import { TipoItem } from "../Models/tipo_item.js";
import { Reserva } from "../Models/reserva.js";
import { ReservaSala } from "../Models/reservaSala.js";
import urlDB from "../dbURL";
export const consultarItensQtd = () =>
  new Promise((resolve, reject) => {
    let token = JSON.parse(localStorage.getItem("token"));
    fetch(urlDB + "itens/qtd", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      }
    })
      .then(response => {
        response
          .json()
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            console.log(err);

            reject(err);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
export const consultarItens = val =>
  new Promise((resolve, reject) => {
    let token = JSON.parse(localStorage.getItem("token"));
    var resItens = [];
    fetch(urlDB + "itens", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email,
        qtd: val
      }
    })
      .then(response => {
        response
          .json()
          .then(itens => {
            itens.forEach(element => {
              var item = new Item(element);
              resItens.push(item);
            });
            resolve(resItens);
          })
          .catch(err => {
            reject(err);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
export const consultarTiposItens = () =>
  new Promise((resolve, reject) => {
    let token = JSON.parse(localStorage.getItem("token"));
    var resTipo = [];
    fetch(urlDB + "tipoItem", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      }
    })
      .then(response => response.json())
      .then(tipos => {
        tipos.forEach(element => {
          var tipo = new TipoItem(element);
          resTipo.push(tipo);
        });
        resolve(resTipo);
      });
  });
export const consultarAgendados = () =>
  new Promise((resolve, reject) => {
    let token = JSON.parse(localStorage.getItem("token"));
    var resAgendados = [];
    fetch(urlDB + "reservados", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      }
    })
      .then(response => response.json())
      .then(agendados => {
        if (
          agendados["dataExists"] !== null &&
          agendados["dataExists"] === "false"
        ) {
          resolve(resAgendados);
          return;
        } else {
          agendados.forEach(element => {
            var agendado = new Reserva(element);
            resAgendados.push(agendado);
          });
          resolve(resAgendados);
        }
      });
  });
export const consultarSalasAgendas = () =>
  new Promise((resolve, reject) => {
    let token = JSON.parse(localStorage.getItem("token"));
    var resAgendados = [];
    fetch(urlDB + "salasreservadas", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: token.acess_token,
        email: token.email
      }
    })
      .then(response => response.json())
      .then(agendados => {
        if (
          agendados["dataExists"] !== null &&
          agendados["dataExists"] === "false"
        ) {
          resolve(resAgendados);
          return;
        } else {
          agendados.forEach(element => {
            var agendado = new ReservaSala(element);
            resAgendados.push(agendado);
          });
          resolve(resAgendados);
        }
      });
  });

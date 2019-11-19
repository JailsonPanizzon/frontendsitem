import jsPDF from 'jspdf';
import 'jspdf-autotable';
import urlDB from '../dbURL';

function getDataBonita(date) {
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
};

function getStatusString(s, a) {
  if (s === -1) {
    return 'Rejeitada';
  } else if (s === 1) {
    if (a) {
      return 'Aguardando Entrega';
    } else {
      return 'Cancelada';
    }
  } else if (s === 2) {
    if (a) {
      return 'Concluída'
    } else {
      return 'Devolvida'
    }
  }
}

function getDataHoraBonita(date) {
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

export async function relatorio101(a) {
  let doc = new jsPDF(), ativo1, dataAtual = new Date();
  let token = JSON.parse(localStorage.getItem("token"));
  if (a === "1") {
    ativo1 = true;
  } else if (a === "2") {
    ativo1 = false;
  } else {
    ativo1 = 0;
  }
  const response = await fetch(urlDB + "relatorio101", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      ativo: ativo1,
    })
  });
  const itens = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 101 - Listagem de Itens', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  let tBody = [], tuple = [];
  if (Array.isArray(itens)) {
    itens.forEach(item => {
      let at;
      if (item.ativo) {
        at = "S";
      } else {
        at = "N";
      }
      tuple = [item.cod, item.descricao, item.tipoitem, getDataBonita(new Date(item.datacadastro)), item.marca, at];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 28,
      head: [['Código', 'Descrição', 'Categoria', 'Data Cadastro', 'Marca', 'Ativo']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 28, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio102() {
  let doc = new jsPDF(), dataAtual = new Date();
  let token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "tipoItens", {
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    }
  });
  const cats = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 102 - Listagem de Categorias', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  let tBody = [], tuple = [];
  cats.forEach(titem => {
    tuple = [titem.cod, titem.descricao];
    tBody.push(tuple);
  });
  doc.autoTable({
    startY: 28,
    head: [['Código', 'Descrição']],
    body: tBody,
  });

  return doc;
}

export async function relatorio103(emp) {
  let doc = new jsPDF(), dataAtual = new Date();
  let token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "relatorio103", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      empresa: emp,
    })
  });
  const itens = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 103 - Itens Reservados', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  let tBody = [], tuple = [];
  if (Array.isArray(itens)) {
    itens.forEach(item => {
      let u = getDataBonita(new Date(item.datafim));
      if (item.datafim === null) {
        u = "Indefinido";
      }

      tuple = [item.cod, item.descricao, getDataBonita(new Date(item.datainicio)), u];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 28,
      head: [['Código', 'Descrição', 'Data de Início', 'Data de Fim']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 28, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio104() {
  let doc = new jsPDF(), dataAtual = new Date();
  let token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "relatorio104", {
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    }
  });
  const itens = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 104 - Itens Sem Reserva', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  let tBody = [], tuple = [];
  if (Array.isArray(itens)) {
    itens.forEach(item => {
      tuple = [item.cod, item.descricao];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 28,
      head: [['Código', 'Descrição']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 28, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio105(emp, d1, d2, indef) {
  let doc = new jsPDF(), dataAtual = new Date(), dinic = d1.toLocaleDateString(), dfinal = d2.toLocaleDateString();
  let token = JSON.parse(localStorage.getItem("token"));
  if (indef) {
    dfinal = -1;
  }
  const response = await fetch(urlDB + "relatorio105", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      empresa: emp,
      dinit: dinic,
      dend: dfinal
    })
  });
  const itens = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 105 - Itens Reservados por Empresa e Período', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  if (dfinal === -1) {
    dfinal = "Indefinido"
  } else {
    dfinal = getDataBonita(new Date(d2));
  }
  doc.text("Período: " + getDataBonita(new Date(dinic)) + " até " + dfinal, doc.internal.pageSize.width / 2, 27, {
    align: 'center',
  }, 0);
  let tBody = [], tuple = [];
  if (Array.isArray(itens)) {
    itens.forEach(item => {
      let u = getDataBonita(new Date(item.datafim));
      if (item.datafim === null) {
        u = "Indefinido";
      }

      tuple = [item.cod, item.descricao, getDataBonita(new Date(item.datainicio)), u, item.empresa];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 32,
      head: [['Código', 'Descrição', 'Data de Início', 'Data de Fim', 'Empresa']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 32, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio106(a, b) {
  let doc = new jsPDF(), dataAtual = new Date();
  let token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "relatorio106", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      cat: a,
    })
  });
  const itens = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 106 - Listagem de Itens por Categoria', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("Categoria: " + b, doc.internal.pageSize.width / 2, 27, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  let tBody = [], tuple = [];
  if (Array.isArray(itens)) {
    itens.forEach(item => {
      tuple = [item.cod, item.descricao, getDataBonita(new Date(item.datacadastro)), item.marca];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 34,
      head: [['Código', 'Descrição', 'Data Cadastro', 'Marca']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 34, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio201(a) {
  let doc = new jsPDF(), dispo, dataAtual = new Date();
  let token = JSON.parse(localStorage.getItem("token"));
  if (a === "1") {
    dispo = true;
  } else if (a === "2") {
    dispo = false;
  } else {
    dispo = 0;
  }
  const response = await fetch(urlDB + "relatorio201", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      disp: dispo,
    })
  });
  const salas = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 201 - Listagem de Salas', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  let tBody = [], tuple = [];
  if (Array.isArray(salas)) {
    salas.forEach(sala => {
      let at;
      if (sala.disponivel) {
        at = "S";
      } else {
        at = "N";
      }
      tuple = [sala.cod, sala.nome, sala.descricao, at];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 28,
      head: [['Código', 'Nome', 'Descrição', 'Disponível p/ Reservas']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 28, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio202(a) {
  let doc = new jsPDF(), dataAtual = new Date();
  let token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "relatorio202", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      sala: a,
    })
  });
  const itens = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 202 - Listagem de Itens por Sala', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  let tBody = [], tuple = [];
  if (Array.isArray(itens)) {
    itens.forEach(item => {
      let at;
      if (item.ativo) {
        at = "S";
      } else {
        at = "N";
      }
      tuple = [item.cod, item.descricao, item.sala, at];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 28,
      head: [['Código', 'Descrição', 'Sala', 'Ativo']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 28, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio203(a, b, c) {
  let doc = new jsPDF(), dataAtual = new Date();
  let token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "relatorio203", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      sala: a,
      dia: getDataBonita(c),
    })
  });
  const reservas = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 203 - Reservas de Sala por Dia', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("Sala: " + b, doc.internal.pageSize.width / 2, 27, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  let tBody = [], tuple = [];
  if (Array.isArray(reservas)) {
    reservas.forEach(reserva => {
      tuple = [getDataHoraBonita(new Date(reserva.datahorainicio)), getDataHoraBonita(new Date(reserva.datahorafim)), reserva.obs, reserva.empresa];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 34,
      head: [['Início', 'Fim', 'Observação', 'Empresa']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 34, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio204(a, b, c1, c2) {
  let doc = new jsPDF(), dataAtual = new Date();
  let token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "relatorio204", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      sala: a,
      d1: getDataBonita(c1),
      d2: getDataBonita(c2),
    })
  });
  const reservas = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 204 - Reservas de Sala por Período', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("Sala: " + b, doc.internal.pageSize.width / 2, 27, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  let tBody = [], tuple = [];
  if (Array.isArray(reservas)) {
    reservas.forEach(reserva => {
      tuple = [getDataHoraBonita(new Date(reserva.datahorainicio)), getDataHoraBonita(new Date(reserva.datahorafim)), reserva.obs, reserva.empresa];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 34,
      head: [['Início', 'Fim', 'Observação', 'Empresa']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 34, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio205(emp, empName) {
  let doc = new jsPDF(), dataAtual = new Date();
  let token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "relatorio205", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      empresa: emp,
    })
  });
  const reservas = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 205 - Reservas de Sala por Empresa', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("Empresa: " + empName, doc.internal.pageSize.width / 2, 27, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  let tBody = [], tuple = [];
  if (Array.isArray(reservas)) {
    reservas.forEach(reserva => {
      tuple = [reserva.sala, getDataHoraBonita(new Date(reserva.datahorainicio)), getDataHoraBonita(new Date(reserva.datahorafim)), reserva.obs];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 34,
      head: [['Sala', 'Início', 'Fim', 'Observação']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 34, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio301(a) {
  let doc = new jsPDF({
    orientation: 'landscape'
  });
  let ativ, dataAtual = new Date();
  let token = JSON.parse(localStorage.getItem("token"));
  if (a === "1") {
    ativ = true;
  } else if (a === "2") {
    ativ = false;
  } else {
    ativ = 0;
  }
  const response = await fetch(urlDB + "relatorio301", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      ativo: ativ,
    })
  });
  const users = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 301 - Listagem de Usuários', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  let tBody = [], tuple = [];
  if (Array.isArray(users)) {
    users.forEach(user => {
      let at, ia;
      if (user.ativo) {
        at = "S";
      } else {
        at = "N";
      }
      if (user.isadmin) {
        ia = "S";
      } else {
        ia = "N";
      }
      tuple = [ia, user.nome, user.email, user.telefone, user.cidade + "/" + user.uf, user.empresa, at];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 28,
      head: [['Administrador', 'Nome', 'Email', 'Telefone', 'Cidade/UF', 'Empresa', 'Ativo']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 28, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio302() {
  let doc = new jsPDF(), dataAtual = new Date();
  let token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "empresas", {
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    }
  });
  const emps = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 302 - Listagem de Empresas', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  let tBody = [], tuple = [];
  emps.forEach(emp => {
    tuple = [emp.cod, emp.nome];
    tBody.push(tuple);
  });
  doc.autoTable({
    startY: 28,
    head: [['Código', 'Nome']],
    body: tBody,
  });

  return doc;
}

export async function relatorio401(emp, empName, d1, d2) {
  let doc = new jsPDF({
    orientation: 'landscape'
  });
  let dataAtual = new Date(), token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "relatorio401", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      empresa: emp,
      datainicio: getDataBonita(d1),
      datafim: getDataBonita(d2)
    })
  });
  const reservas = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 401 - Reservas de Item por Período', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("Empresa: " + empName, doc.internal.pageSize.width / 2, 27, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  let tBody = [], tuple = [];
  if (Array.isArray(reservas)) {
    reservas.forEach(reserva => {
      tuple = [reserva.item_cod + ' - ' + reserva.item_desc, getDataBonita(new Date(reserva.datainicio)), getDataBonita(new Date(reserva.datafim)), reserva.obs, reserva.empresa, getStatusString(reserva.status, reserva.ativo)];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 34,
      head: [['Item', 'Início', 'Fim', 'Observação', 'Empresa', 'Status']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 34, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio402(emp, empName) {
  let doc = new jsPDF();
  let dataAtual = new Date(), token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "relatorio402", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      empresa: emp
    })
  });
  const reservas = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 402 - Reservas de Item Futuras', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("Empresa: " + empName, doc.internal.pageSize.width / 2, 27, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  let tBody = [], tuple = [];
  if (Array.isArray(reservas)) {
    reservas.forEach(reserva => {
      tuple = [reserva.item_cod + ' - ' + reserva.item_desc, getDataBonita(new Date(reserva.datainicio)), getDataBonita(new Date(reserva.datafim)), reserva.obs, getStatusString(reserva.status, reserva.ativo)];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 34,
      head: [['Item', 'Início', 'Fim', 'Observação', 'Status']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 34, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio403(emp, empName, d1, d2) {
  let doc = new jsPDF({
    orientation: 'landscape'
  });
  let dataAtual = new Date(), token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "relatorio403", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      empresa: emp,
      datainicio: getDataBonita(d1),
      datafim: getDataBonita(d2)
    })
  });
  const reservas = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 403 - Reservas de Sala por Período', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("Empresa: " + empName, doc.internal.pageSize.width / 2, 27, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  let tBody = [], tuple = [];
  if (Array.isArray(reservas)) {
    reservas.forEach(reserva => {
      let st = "Ok";
      if(!(reserva.ativo)){
        st = "Rejeitada";
      }
      tuple = [reserva.sala, getDataHoraBonita(new Date(reserva.datahorainicio)), getDataHoraBonita(new Date(reserva.datahorafim)), reserva.obs, reserva.empresa, st];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 34,
      head: [['Sala', 'Início', 'Fim', 'Observação', 'Empresa', 'Status']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 34, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio404() {
  let doc = new jsPDF({
    orientation: 'landscape'
  });
  let dataAtual = new Date(), token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "relatorio404", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      status: 1,
    })
  });
  const reservas = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 404 - Reservas de Item Pendentes', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  let tBody = [], tuple = [];
  if (Array.isArray(reservas)) {
    reservas.forEach(reserva => {
      let u = getDataBonita(new Date(reserva.datafim));
      if (reserva.datafim === null) {
        u = "Indefinido";
      }
      tuple = [reserva.item_cod + ' - ' + reserva.item_desc, getDataBonita(new Date(reserva.datainicio)), u, reserva.obs, reserva.empresa, "Aguardando Entrega"];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 28,
      head: [['Item', 'Início', 'Fim', 'Observação', 'Empresa', 'Status']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 28, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio405(emp, empName, d1) {
  let doc = new jsPDF({
    orientation: 'landscape'
  });
  let dataAtual = new Date(), token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "relatorio405", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      empresa: emp,
      datainicio: getDataBonita(d1),
    })
  });
  const reservas = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 405 - Reservas Ativas', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("Empresa: " + empName, doc.internal.pageSize.width / 2, 27, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  let tBody = [], tuple = [];
  if (Array.isArray(reservas)) {
    reservas.forEach(reserva => {
      let u = getDataBonita(new Date(reserva.datafim));
      if (reserva.datafim === null) {
        u = "Indefinido";
      }
      tuple = [reserva.item_cod + ' - ' + reserva.item_desc, getDataBonita(new Date(reserva.datainicio)), u, reserva.obs, reserva.empresa];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 34,
      head: [['Item', 'Início', 'Fim', 'Observação', 'Empresa']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 34, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio406(emp, empName, d1) {
  let doc = new jsPDF({
    orientation: 'landscape'
  });
  let dataAtual = new Date(), token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "relatorio406", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      empresa: emp,
      datainicio: getDataBonita(d1),
    })
  });
  const reservas = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 406 - Reservas Rejeitadas', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("Empresa: " + empName, doc.internal.pageSize.width / 2, 27, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  let tBody = [], tuple = [];
  if (Array.isArray(reservas)) {
    reservas.forEach(reserva => {
      let u = getDataBonita(new Date(reserva.datafim));
      if (reserva.datafim === null) {
        u = "Indefinido";
      }
      tuple = [reserva.item_cod + ' - ' + reserva.item_desc, getDataBonita(new Date(reserva.datainicio)), u, reserva.obs, reserva.empresa];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 34,
      head: [['Item', 'Início', 'Fim', 'Observação', 'Empresa']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 34, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio407(emp, empName) {
  let doc = new jsPDF({
    orientation: 'landscape'
  });
  let dataAtual = new Date(), token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "relatorio407", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      empresa: emp,
    })
  });
  const reservas = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 407 - Reservas Atrasadas', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("Empresa: " + empName, doc.internal.pageSize.width / 2, 27, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  let tBody = [], tuple = [];
  if (Array.isArray(reservas)) {
    reservas.forEach(reserva => {
      tuple = [reserva.item_cod + ' - ' + reserva.item_desc, getDataBonita(new Date(reserva.datainicio)), getDataBonita(new Date(reserva.datafim)), reserva.obs, reserva.empresa];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 34,
      head: [['Item', 'Início', 'Fim', 'Observação', 'Empresa']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 34, {
      align: 'center',
    }, 0);
  }

  return doc;
}

export async function relatorio408(emp, empName, d1) {
  let doc = new jsPDF({
    orientation: 'landscape'
  });
  let dataAtual = new Date(), token = JSON.parse(localStorage.getItem("token"));
  const response = await fetch(urlDB + "relatorio408", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      authorization: token.acess_token,
      email: token.email
    },
    body: JSON.stringify({
      empresa: emp,
      datainicio: getDataBonita(d1),
    })
  });
  const reservas = await response.json();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SITEM - SudoTec', doc.internal.pageSize.width / 2, 10, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Relatório 408 - Reservas Devolvidas', doc.internal.pageSize.width / 2, 17, {
    align: 'center',
  }, 0);
  doc.setFontSize(12);
  doc.text("Data de Emissão: " + getDataBonita(dataAtual), doc.internal.pageSize.width / 2, 22, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("Empresa: " + empName, doc.internal.pageSize.width / 2, 27, {
    align: 'center',
  }, 0);
  doc.setFont('helvetica', 'normal');
  let tBody = [], tuple = [];
  if (Array.isArray(reservas)) {
    reservas.forEach(reserva => {
      let u = getDataBonita(new Date(reserva.datafim));
      if (reserva.datafim === null) {
        u = "Indefinido";
      }
      tuple = [reserva.item_cod + ' - ' + reserva.item_desc, getDataBonita(new Date(reserva.datainicio)), u, reserva.obs, reserva.empresa];
      tBody.push(tuple);
    });
    doc.autoTable({
      startY: 34,
      head: [['Item', 'Início', 'Fim', 'Observação', 'Empresa']],
      body: tBody,
    });
  } else {
    doc.text("Sem registros", doc.internal.pageSize.width / 2, 34, {
      align: 'center',
    }, 0);
  }

  return doc;
}
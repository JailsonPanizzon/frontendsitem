import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

export function SimpleTable(rows, cabecalho) {
  let tabela = [];
  let cont = 0;
  let cabec = [];
  rows.forEach(row => {
    cont++;
    let v = [];
    row.forEach(val => {
      v.push(
        <TableCell align="left" style={{ fontSize: val!== undefined && val.length > 22 ? 10 : 14 }}>
          {val}
        </TableCell>
      );
    });
    tabela.push(
      <TableRow key={row.name} className={cont % 2 === 0 ? "row0" : "row1"}>
        {v}
      </TableRow>
    );
  });
  cabecalho.forEach(cab => {
    cabec.push(<TableCell>{cab}</TableCell>);
  });

  return (
    <Paper>
      <Table>
        <TableHead className="cabecalho">
          <TableRow>{cabec}</TableRow>
        </TableHead>
        <TableBody>{tabela}</TableBody>
      </Table>
    </Paper>
  );
}
